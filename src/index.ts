import { spawnSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import * as process from "process";

function exec(cmd: string, args: string[]) {
    const child = spawnSync(cmd, args, { encoding: "utf8" });
    if (child.error || child.status !== 0) {
        console.error([cmd, ...args], "exited with", child.status);
        console.error(child.error);
        process.exit(1);
    }
    return child.stdout;
}

type FileTester = {regex: RegExp, key: string} | {regex: RegExp, keyIndex: number} | ((file: string) => string | null);

function testFile(file: string, tester: FileTester): string | null {
    if (typeof tester === 'function') {
        return tester(file);
    } else {
        const regex = new RegExp(tester.regex);
        const result = regex.exec(file);
        if (result) {
            let key = null;
            if ('keyIndex' in tester) {
                key = result[tester.keyIndex];
            } else {
                key = tester.key;
            }
            if (!key) {
                console.error("Unable to add prefix for regex", tester);
                return null;
            }
            return key;
        }
    }
    return null;
}

export function addPrefixes(config: {
    baseDir: string;
    prefixes: FileTester[]
}) {
    const commitMsgFile = resolve(config.baseDir, process.argv[2]);
    const commitType = process.argv[3] || null;
    const sha = process.argv[4] || null; // If ammend

// Skip if type is set
    if (commitType) {
        return;
    }

    let content = readFileSync(commitMsgFile, "utf8");
    const files = exec("git", ["diff", "--name-only", "--cached"])
        .trim()
        .split("\n");

    const commitMsgPrefixes: string[] = [];
    for (const tester of config.prefixes) {
        for (const file of files) {
            let result = testFile(file, tester);
            if (result) {
                commitMsgPrefixes.push(result);
                break;
            }
        }
    }
    if (commitMsgPrefixes.length) {
        content = `(${commitMsgPrefixes.sort().join(",")}) \n${content}`;
        writeFileSync(commitMsgFile, content, "utf8");
    }

}



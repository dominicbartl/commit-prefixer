# commit-prefixer

Add prefixes to commit messages based on changed files.

Add this script to your `prepare-commit-msg`

```javascript
#!/usr/bin/env node
const { addPrefixes } = require('commit-prefixer');

addPrefixes({
    // Point to the root of your repo
	baseDir: `${__dirname}/../..`,
    // A list of prefixes that check for changed files
	prefixes: [
        // Matching all files under the .github directory
        {
            regex: /^.github\/([a-z]+)\/.*$/,
            key: 'ci',
        },
        // Matching all files in subfolders under a project folder.
        // Use the subfolder name as a key
        // e.g. projects/frontend/src/index.ts => (frontend)
		{
			regex: /^projects\/([a-z]+)\/\/.*$/,
			keyIndex: 1,
		},
	],
});
```

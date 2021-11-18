const {spawnSync} = require('child_process');
console.log('Publishing all...');
console.log(process.argv);
spawnSync('rush')
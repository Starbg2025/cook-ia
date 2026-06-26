import { execSync } from 'child_process';
console.log(execSync('git log -n 5').toString());

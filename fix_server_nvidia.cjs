const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Just remove "Nvidia" from text strings
content = content.replace(/Nvidia Free ->/g, "");
content = content.replace(/Nvidia Free -> Cycle/g, "Cycle");
content = content.replace(/, Nvidia/g, "");
content = content.replace(/Nvidia NIM Models/g, "Removed Models");
content = content.replace(/Nvidia/g, "Other");

fs.writeFileSync('server.ts', content);
console.log("Fixed server.ts text references");

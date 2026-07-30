const fs = require('fs');

function fix(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the triple escaped backticks
    content = content.replace(/\\`\\`\\`/g, '\\`\\`\\`');
    // Actually, wait, it says Syntax error "\" because it's probably parsing it weirdly.
    // Let's just remove the "(```)" from the instruction text entirely, it's easier and won't break the build!
    content = content.replace(/DO NOT use markdown code blocks[^\n]*/g, "DO NOT use markdown code blocks.");
    content = content.replace(/content'\).\\\`/g, "content').");
    
    fs.writeFileSync(file, content);
}
fix('server.ts');
fix('src/services/geminiService.ts');

const fs = require('fs');

const newInstruction = fs.readFileSync('systemInstruction.txt', 'utf8');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find where the systemInstruction string starts and ends
    const startStr = 'const systemInstruction = `';
    let startIndex = content.indexOf(startStr);
    
    if (startIndex === -1) {
        console.error("Could not find systemInstruction in", filePath);
        return;
    }
    
    startIndex += 'const systemInstruction = '.length; // Keep the assignment
    
    let endIndex = content.indexOf('`;', startIndex);
    if (endIndex === -1) {
        endIndex = content.indexOf('`\n;', startIndex);
    }
    
    if (endIndex === -1) {
        console.error("Could not find end of systemInstruction in", filePath);
        return;
    }
    
    endIndex += 1; // Include the closing backtick
    
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    
    const newContent = before + '`' + newInstruction + after;
    fs.writeFileSync(filePath, newContent);
    console.log("Successfully replaced in", filePath);
}

replaceInFile('server.ts');
replaceInFile('src/services/geminiService.ts');

const fs = require('fs');

const rawInstruction = fs.readFileSync('systemInstruction.txt', 'utf8');
// Escape backticks and dollar signs for template literal
const escapedInstruction = rawInstruction.replace(/`/g, '\\`').replace(/\$/g, '\\$');

function fixSyntax(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find 'const systemInstruction ='
    const startStr = 'const systemInstruction = `';
    const startIndex = content.indexOf(startStr);
    
    if (startIndex === -1) {
        console.error("Could not find start in", filePath);
        return;
    }
    
    // The broken string ends exactly where the JSON format instructions ended.
    // Let's find "path' (e.g., "src/index.html") and 'content' (the file content)."
    const endMarker = "path' (e.g., \"src/index.html\") and 'content' (the file content).`";
    let endIndex = content.indexOf(endMarker);
    
    if (endIndex === -1) {
    	const endMarker2 = "path' (e.g., \"src/index.html\") and 'content' (the file content).\\`";
    	endIndex = content.indexOf(endMarker2);
    	if (endIndex !== -1) endIndex += endMarker2.length;
    } else {
    	endIndex += endMarker.length;
    }
    
    if (endIndex === -1 || endIndex < startIndex) {
        console.error("Could not find end marker in", filePath);
        
        // Let's try to just find the next line that looks like code?
        // Actually, let's just do a manual replace of the whole block.
        return;
    }
    
    // Replace it!
    const before = content.substring(0, startIndex + startStr.length - 1); // up to '='
    const after = content.substring(endIndex);
    
    // We add the backticks around our escaped instruction.
    // Wait, the endMarker might have included the backtick or not. 
    // I will just append `;` after the backtick.
    const newContent = before + '`' + escapedInstruction + '`;\n' + (after.startsWith(';') ? after.substring(1) : after);
    
    fs.writeFileSync(filePath, newContent);
    console.log("Fixed syntax in", filePath);
}

fixSyntax('server.ts');
fixSyntax('src/services/geminiService.ts');

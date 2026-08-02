const fs = require('fs');

let file = 'src/pages/DocumentLogging.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix syntax error on line 621 (Main file)
// We just remove the inner { for activeEdits if it's there
content = content.replace(/\{canEdit && \([\s\S]*?\) && \(\s*\{activeEdits/g, (match) => {
    return match.replace('{activeEdits', 'activeEdits');
});

// Fix the closing tags for Main file
content = content.replace(/<\/button>\s*\)\s*\)\}/g, '</button> ) )}');

// Fix memo!.id to log!.id everywhere in the injected activeEdits blocks
content = content.replace(/fileManagerModal\.memo!\.id/g, 'fileManagerModal.log!.id');

// Fix the syntax error in the extra attachments
content = content.replace(/\{canEdit && isDocx && file\?\.url && \(\s*\{activeEdits/g, '{canEdit && isDocx && file?.url && ( activeEdits');

fs.writeFileSync(file, content);
console.log('Fixed DocumentLogging.tsx');

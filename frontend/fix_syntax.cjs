
const fs = require('fs');

function fixSyntax(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /\{isDocx && file\?\.url && \(\s*\{activeEdits\[/g,
    '{isDocx && file?.url && ( activeEdits['
  );
  content = content.replace(
    /\}\s*\)\s*\}/g,
    '})}'
  );
  
  // Actually, wait, let's just do an exact string replace for the start
  content = content.replace(
    '{isDocx && file?.url && (\\n                              {activeEdits',
    '{isDocx && file?.url && (\\n                              activeEdits'
  );
  content = content.replace(
    '                              )}\\n                            )}',
    '                              )\\n                            )}'
  );
  
  // Wait, let's just use simpler replace
  content = content.replace('{activeEdits[\\_\\] ? (', 'activeEdits[\\_\\] ? (');
  content = content.replace('</button>\\n                              )}', '</button>\\n                              )');

  // Let's do a more robust regex for the exact error:
  content = content.replace(/\{isDocx && file\?\.url && \(\s*\{activeEdits/g, '{isDocx && file?.url && ( activeEdits');
  
  // And fix the closing tags:
  // The original injected block was wrapped in {activeEdits[...] ? (...) : (...)}
  // The user had {isDocx && file?.url && ( {activeEdits...} )}
  // So there's an extra } at the end.
  content = content.replace(/<\/button>\s*\)\s*\}\s*\)\}/g, '</button> ) )}');

  fs.writeFileSync(file, content);
}

fixSyntax('src/pages/DocumentLogging.tsx');
fixSyntax('src/pages/Memoranda.tsx');
console.log('Fixed syntax!');


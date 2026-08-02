const fs = require('fs');
let content = fs.readFileSync('src/pages/Memoranda.tsx', 'utf8');

// 1. Replace VITE_API_URL
content = content.replace(/\`\$\{import\.meta\.env\.VITE_API_URL\}/g, '\`\$\{import.meta.env.VITE_API_URL || \'\'\}');

// 2. Fix handleEditInDocs error handling
content = content.replace(
  /if \(!response\.ok\) throw new Error\(\"Google Drive API error\.\"\);/g,
  'if (!response.ok) { const errData = await response.json(); throw new Error(errData.error || errData.message || \"Google Drive API error.\"); }'
);

// 3. Fix handleSyncChanges error handling
content = content.replace(
  /if \(!response\.ok\) throw new Error\(\"Sync failed\.\"\);/g,
  'if (!response.ok) { const errData = await response.json(); throw new Error(errData.error || errData.message || \"Sync failed.\"); }'
);

// 4. Update the bridge title
content = content.replace(
  /<h3 className=\"text-xl font-semibold text-gray-900 mb-3\">Live Document Bridge<\/h3>/g,
  '<h3 className=\"text-xl font-semibold text-gray-900 mb-3\">{viewingFile.name}</h3>'
);

fs.writeFileSync('src/pages/Memoranda.tsx', content);
console.log('Fixed Memoranda.tsx');

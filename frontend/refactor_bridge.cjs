const fs = require('fs');

function refactorFile(filePath, apiEndpoint) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove the entire viewingFile block (Google Docs Viewer)
  content = content.replace(/\{\/\* --- GOOGLE DOCS VIEWER.*?\}\)/s, '');

  // 2. Refactor handleEditInDocs
  const editRegex = /const handleEditInDocs = async \(\) => \{[\s\S]*?finally \{ setIsPushing\(false\); \}\n  \};/;
  const newEdit = `const handleEditInDocs = async (memoId: number, targetUrl?: string) => { 
    setIsPushing(true);
    try {
      const response = await fetch(\`\${import.meta.env.VITE_API_URL || ''}/api/${apiEndpoint}/\${memoId}/edit-request\`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetUrl })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || errData.message || "Google Drive API error.");
      }
      const data = await response.json(); 
      setActiveEdits(prev => ({ ...prev, [\`\${memoId}_\${targetUrl || 'main'}\`]: data.driveId }));
      window.open(data.link, '_blank');
    } catch (error: any) { showNotify(error.message, "error"); } finally { setIsPushing(false); }
  };`;
  content = content.replace(editRegex, newEdit);

  // 3. Refactor handleSyncChanges
  const syncRegex = /const handleSyncChanges = async \(\) => \{[\s\S]*?finally \{ setIsSyncing\(false\); \}\n  \};/;
  const newSync = `const handleSyncChanges = async (memoId: number, targetUrl?: string) => { 
    const currentDriveId = activeEdits[\`\${memoId}_\${targetUrl || 'main'}\`]; 
    if (!currentDriveId) return; setIsSyncing(true);
    try {
      const response = await fetch(\`\${import.meta.env.VITE_API_URL || ''}/api/${apiEndpoint}/\${memoId}/sync-request\`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ driveId: currentDriveId, targetUrl }) 
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || errData.message || "Sync failed.");
      }
      showNotify("Changes synced successfully from Google Docs!", "success");
      setActiveEdits(prev => { const updated = { ...prev }; delete updated[\`\${memoId}_\${targetUrl || 'main'}\`]; return updated; });
    } catch (error: any) { showNotify(error.message, "error"); } finally { setIsSyncing(false); }
  };`;
  content = content.replace(syncRegex, newSync);

  // 4. Update the buttons in the FileManagerModal (Primary Document)
  const primaryBtnRegex = /<button onClick=\{\(\) => \{\s*setViewingFile\(\{ localUrl: `\$\{import\.meta\.env\.VITE_API_URL \|\| ''\}\$\{[\s\S]*?Edit via Docs\s*<\/button>/g;
  
  const newPrimaryBtn = `{activeEdits[\`\${fileManagerModal.memo!.id}_main\`] ? (
                          <button onClick={() => handleSyncChanges(fileManagerModal.memo!.id)} disabled={isSyncing} className="flex-1 sm:flex-none px-3 py-1.5 bg-green-50 border border-green-300 hover:bg-green-100 text-green-700 text-xs font-medium rounded shadow-sm flex items-center justify-center transition-colors">
                            {isSyncing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin"/> : <Save className="w-3.5 h-3.5 mr-1.5"/>} Pull Changes
                          </button>
                       ) : (
                          <button onClick={() => handleEditInDocs(fileManagerModal.memo!.id)} disabled={isPushing} className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded shadow-sm flex items-center justify-center transition-colors">
                            {isPushing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin"/> : <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-blue-600"/>} Open in Docs
                          </button>
                       )}`;
  content = content.replace(primaryBtnRegex, newPrimaryBtn);

  // 5. Update the buttons in the FileManagerModal (Attachments)
  const attachmentBtnRegex = /<button onClick=\{\(\) => \{\s*setViewingFile\(\{ localUrl: `\$\{import\.meta\.env\.VITE_API_URL \|\| ''\}\$\{file\.url\}`[\s\S]*?Edit\s*<\/button>/g;
  
  const newAttachmentBtn = `{activeEdits[\`\${fileManagerModal.memo!.id}_\${file.url}\`] ? (
                                <button onClick={() => handleSyncChanges(fileManagerModal.memo!.id, file.url)} disabled={isSyncing} className="flex-1 sm:flex-none px-3 py-1.5 bg-green-50 border border-green-300 hover:bg-green-100 text-green-700 text-xs font-medium rounded shadow-sm flex items-center justify-center transition-colors">
                                  {isSyncing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin"/> : <Save className="w-3.5 h-3.5 mr-1.5"/>} Pull Changes
                                </button>
                              ) : (
                                <button onClick={() => handleEditInDocs(fileManagerModal.memo!.id, file.url)} disabled={isPushing} className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded shadow-sm flex items-center justify-center transition-colors">
                                  {isPushing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin"/> : <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-blue-600"/>} Open in Docs
                                </button>
                              )}`;
  content = content.replace(attachmentBtnRegex, newAttachmentBtn);

  fs.writeFileSync(filePath, content);
}

refactorFile('src/pages/DocumentLogging.tsx', 'document-tracking');
refactorFile('src/pages/Memoranda.tsx', 'memoranda');
console.log('Refactored both files');

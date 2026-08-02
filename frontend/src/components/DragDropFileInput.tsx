import React, { useState } from 'react';
import { Upload } from 'lucide-react';

export const DragDropFileInput = ({ onFileSelect, label, inputRef, currentFile, accept }: { onFileSelect: (file: File | null) => void, label: string, inputRef?: React.RefObject<HTMLInputElement>, currentFile: File | null, accept?: string }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
      if (inputRef?.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(e.dataTransfer.files[0]);
        inputRef.current.files = dataTransfer.files;
      }
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center"><Upload className="w-4 h-4 mr-1.5 text-gray-400" /> {label}</label>
      <div
        className={`border-2 border-dashed p-3 rounded-md text-center transition-colors relative overflow-hidden ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
      >
        <Upload className={`w-5 h-5 mx-auto mb-1.5 transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />

        {currentFile ? (
          <div className="flex flex-col items-center relative z-20">
            <span className="text-sm font-medium text-gray-800 mb-0.5 truncate max-w-full px-4">{currentFile.name}</span>
            <span className="text-[10px] text-gray-500 mb-2">{(currentFile.size / 1024 / 1024).toFixed(2)} MB</span>
            <button type="button" onClick={(e) => { e.preventDefault(); onFileSelect(null); if (inputRef?.current) inputRef.current.value = ''; }} className="text-xs text-red-600 hover:text-red-800 font-medium bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded transition-colors shadow-sm">Remove File</button>
          </div>
        ) : (
          <>
            <p className="text-[11px] text-gray-600 font-medium mb-0.5">Drag & drop your file here</p>
            <p className="text-[10px] text-gray-400 mb-2">or click to browse</p>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => onFileSelect(e.target.files ? e.target.files[0] : null)}
            />
            <div className="inline-flex px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded shadow-sm transition-colors relative z-0 pointer-events-none">
              Browse Files
            </div>
          </>
        )}
      </div>
    </div>
  );
};

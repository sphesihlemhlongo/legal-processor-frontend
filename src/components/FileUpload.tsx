import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, Plus } from 'lucide-react';

interface FileUploadProps {
  onUpload: (files: File[], metadata?: { titles?: string[]; sections?: string[] }) => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isProcessing }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [fileTitles, setFileTitles] = useState<string[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => 
      file.name.toLowerCase().endsWith('.pdf') ||
      file.name.toLowerCase().endsWith('.docx') ||
      file.name.toLowerCase().endsWith('.txt')
    );
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setFileTitles(prev => [...prev, ...validFiles.map(f => f.name)]);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      file.name.toLowerCase().endsWith('.pdf') ||
      file.name.toLowerCase().endsWith('.docx') ||
      file.name.toLowerCase().endsWith('.txt')
    );
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setFileTitles(prev => [...prev, ...validFiles.map(f => f.name)]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFileTitles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(() => {
    if (selectedFiles.length === 0) return;
    
    const metadata = showMetadata ? { titles: fileTitles } : undefined;
    onUpload(selectedFiles, metadata);
    
    // Clear selection after upload
    setSelectedFiles([]);
    setFileTitles([]);
    setShowMetadata(false);
  }, [selectedFiles, fileTitles, showMetadata, onUpload]);

  const updateTitle = useCallback((index: number, title: string) => {
    setFileTitles(prev => {
      const updated = [...prev];
      updated[index] = title;
      return updated;
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Legal Documents</h2>
        <p className="text-slate-600">Support for PDF, DOCX, and TXT files. Upload multiple documents for batch processing.</p>
      </div>

      {/* Drag and Drop Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-slate-900 mb-1">
              Drop files here or click to browse
            </p>
            <p className="text-slate-500">
              Supports PDF, DOCX, and TXT files
            </p>
          </div>
          
          <label className="cursor-pointer inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
            <Plus className="w-5 h-5 mr-2" />
            Choose Files
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isProcessing}
            />
          </label>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Selected Files ({selectedFiles.length})
            </h3>
            <button
              onClick={() => setShowMetadata(!showMetadata)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {showMetadata ? 'Hide' : 'Add'} Metadata
            </button>
          </div>

          <div className="space-y-3">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{file.name}</p>
                    <p className="text-sm text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {showMetadata && (
                      <input
                        type="text"
                        placeholder="Custom title (optional)"
                        value={fileTitles[index] || ''}
                        onChange={(e) => updateTitle(index, e.target.value)}
                        className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors duration-200"
                  disabled={isProcessing}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpload}
            disabled={isProcessing || selectedFiles.length === 0}
            className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 ${
              isProcessing || selectedFiles.length === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
            }`}
          >
            {isProcessing ? 'Processing...' : `Process ${selectedFiles.length} Document${selectedFiles.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Scale, FileText, Zap, Upload, CheckCircle, Clock, Download, AlertCircle, Loader } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface UploadedFile {
  name: string;
  id: string;
  status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'failed';
  uploadTime: string;
  error?: string;
}

interface ProcessingResult {
  id: string;
  original_file: string;
  processed_time: string;
  processing_duration?: string;
  total_chunks: number;
  successful_chunks: number;
  failed_chunks: number;
  cost: string;
  sharepoint?: {
    uploaded: boolean;
    files_count: number;
  };
  wordpress?: {
    uploaded: boolean;
    urls: string[];
  };
  docx_files?: string[];
  status: 'completed' | 'failed';
  error?: string;
}

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processedResults, setProcessedResults] = useState<ProcessingResult[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
    setFiles(selectedFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    setFiles(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    setUploading(true);
    const uploaded: UploadedFile[] = [];

    for (const file of files) {
      const tempFile: UploadedFile = {
        name: file.name,
        id: `temp-${Date.now()}`,
        status: 'uploading',
        uploadTime: new Date().toISOString()
      };

      setUploadedFiles(prev => [...prev, tempFile]);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Upload failed');

        const result = await response.json();

        const completedFile: UploadedFile = {
          name: file.name,
          id: result.file_id,
          status: 'uploaded',
          uploadTime: new Date().toISOString()
        };

        uploaded.push(completedFile);

        setUploadedFiles(prev =>
          prev.map(f => f.id === tempFile.id ? completedFile : f)
        );
      } catch (error) {
        const failedFile: UploadedFile = {
          name: file.name,
          id: `error-${Date.now()}`,
          status: 'failed',
          uploadTime: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Upload failed'
        };

        setUploadedFiles(prev =>
          prev.map(f => f.id === tempFile.id ? failedFile : f)
        );
      }
    }

    setFiles([]);
    setUploading(false);
  };

  const checkForResults = async () => {
    try {
      const response = await fetch(`${API_URL}/status`);
      if (!response.ok) return;

      const statusData = await response.json();

      setUploadedFiles(prev =>
        prev.map(f => {
          const update = statusData.files.find((s: any) => s.original_file === f.name);
          if (update) return { ...f, status: update.status };
          return f;
        })
      );

      statusData.files.forEach((fileStatus: any) => {
        if (fileStatus.status === 'completed' && !processedResults.find(r => r.original_file === fileStatus.original_file)) {
          setProcessedResults(prev => [...prev, fileStatus]);
        }
      });
    } catch (error) {
      console.error('Error checking results:', error);
    }
  };

  useEffect(() => {
  if (uploadedFiles.length > 0) {
    const hasProcessing = uploadedFiles.some(f =>
      f.status === 'uploaded' || f.status === 'processing' || f.status === 'uploading'
    );

    if (!hasProcessing) return; // Stop polling if all done

    const interval = setInterval(checkForResults, 10000);
    checkForResults();
    return () => clearInterval(interval);
  }
}, [uploadedFiles]);

  const getStatusIcon = (status: UploadedFile['status']) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    if (status === 'failed') return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (status === 'processing') return <Loader className="w-5 h-5 text-amber-500 animate-spin" />;
    if (status === 'uploading') return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
    return <Clock className="w-5 h-5 text-blue-500" />;
  };

  const getStatusText = (status: UploadedFile['status']) => {
    if (status === 'uploading') return 'Uploading...';
    if (status === 'uploaded') return 'Uploaded - waiting for processing';
    if (status === 'processing') return 'Processing with AI...';
    if (status === 'completed') return 'Completed';
    return 'Upload failed';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">LegalProcessor</h1>
              <p className="text-slate-600">Convert legal documents to plain English</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Upload Documents</h2>
              <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer text-blue-600 font-medium hover:text-blue-700">
                  Choose PDF files
                </label>
                <p className="text-slate-500 text-sm mt-2">or drag and drop</p>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700 truncate flex-1">{file.name}</span>
                      <span className="text-xs text-slate-500 ml-2">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ))}
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition font-medium"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center">
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Uploading...
                      </span>
                    ) : (
                      `Upload ${files.length} file(s)`
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">What We Do</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-lg flex-shrink-0">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Plain English Translation</h3>
                    <p className="text-slate-600 text-sm">Convert complex legal language into clear text</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg flex-shrink-0">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Bullet-Point Summaries</h3>
                    <p className="text-slate-600 text-sm">Get concise summaries preserving legal meaning</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    <strong>Processing time:</strong> Typically 30 minutes to 2 hours depending on document length.
                    Files are automatically uploaded to SharePoint and WordPress.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {uploadedFiles.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Upload Status</h2>
                <div className="space-y-3">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {getStatusIcon(file.status)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                          <p className="text-xs text-slate-500">{getStatusText(file.status)}</p>
                          {file.error && <p className="text-xs text-red-600 mt-1">{file.error}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {processedResults.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Completed Documents</h2>
                <div className="space-y-4">
                  {processedResults.map((result, idx) => (
                    <div key={idx} className="p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <span className="font-medium text-slate-900">{result.original_file}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <div className="text-slate-600"><span className="font-medium">Chunks:</span> {result.successful_chunks}/{result.total_chunks}</div>
                        <div className="text-slate-600"><span className="font-medium">Cost:</span> {result.cost}</div>
                      </div>
                      {result.wordpress?.urls && result.wordpress.urls.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-emerald-200">
                          <p className="text-xs font-medium text-slate-700 mb-2">Download Files:</p>
                          <div className="flex flex-wrap gap-2">
                            {result.wordpress.urls.map((url, urlIdx) => (
                              <a key={urlIdx} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 bg-white text-blue-600 text-xs rounded-lg hover:bg-blue-50 border border-blue-200">
                                <Download className="w-3 h-3 mr-1" />File {urlIdx + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-emerald-200">
                        <p className="text-xs text-slate-500">Uploaded to SharePoint ✓ | WordPress ✓</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadedFiles.length === 0 && processedResults.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No documents yet</h3>
                <p className="text-slate-600 text-sm">Upload a PDF to get started</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-slate-500">
        <p>Files are processed securely and stored for 6 hours before automatic deletion</p>
      </footer>
    </div>
  );
};

export default App;

import React from 'react';
import { Download, FileText, List, ExternalLink } from 'lucide-react';

interface ProcessedFile {
  plain_english: string;
  summary: string;
}

interface DownloadResultsProps {
  files: Record<string, ProcessedFile>;
}

export const DownloadResults: React.FC<DownloadResultsProps> = ({ files }) => {
  const handleDownload = async (fileId: string, fileType: 'plain' | 'summary') => {
    try {
      const response = await fetch(`https://legalprocessorbackend.vercel.app/download/${fileId}/${fileType}`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Extract filename from response headers or create one
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `processed_document_${fileType}.docx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Download Results</h3>
        <p className="text-slate-600 text-sm">Your processed documents are ready for download</p>
      </div>

      <div className="space-y-4">
        {Object.entries(files).map(([fileId, filePaths]) => (
          <div key={fileId} className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <h4 className="font-medium text-slate-900 mb-4">Document: {fileId.slice(-8)}...</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Plain English Version */}
              <div className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-lg">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-slate-900">Plain English</h5>
                    <p className="text-sm text-slate-600">Human-readable version</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDownload(fileId, 'plain')}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Download DOCX</span>
                </button>
              </div>

              {/* Summary Version */}
              <div className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <List className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-slate-900">Summary</h5>
                    <p className="text-sm text-slate-600">Bullet-point format</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDownload(fileId, 'summary')}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Download DOCX</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900 mb-1">Download Instructions</h5>
            <p className="text-blue-700 text-sm">
              Each document generates two versions: a plain English translation and a bullet-point summary. 
              Both preserve the legal meaning while making the content more accessible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { FileUpload } from './components/FileUpload';
import { ProcessingStatus } from './components/ProcessingStatus';
import { DownloadResults } from './components/DownloadResults';
import { useDocumentProcessor } from './hooks/useDocumentProcessor';
import { Scale, FileText, Zap } from 'lucide-react';

function App() {
  const {
    currentJob,
    processingStatus,
    processedFiles,
    uploadDocuments,
    isProcessing
  } = useDocumentProcessor();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload and Features */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <FileUpload onUpload={uploadDocuments} isProcessing={isProcessing} />
            </div>
            
            {/* Features */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">What We Do</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-lg">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Plain English Translation</h3>
                    <p className="text-slate-600 text-sm">Convert complex legal language into clear, understandable text</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Bullet-Point Summaries</h3>
                    <p className="text-slate-600 text-sm">Get concise summaries that preserve all legal meaning</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Processing and Results */}
          <div className="space-y-8">
            {currentJob && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <ProcessingStatus 
                  jobId={currentJob} 
                  status={processingStatus} 
                />
              </div>
            )}
            
            {Object.keys(processedFiles).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <DownloadResults files={processedFiles} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
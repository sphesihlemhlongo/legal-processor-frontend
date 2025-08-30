import React, { useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface FileStatus {
  filename: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  error?: string;
  file_id?: string;
}

interface ProcessingStatusData {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  files: FileStatus[];
  total_files: number;
  completed_files: number;
  started_at: string;
  completed_at?: string;
  error?: string;
}

interface ProcessingStatusProps {
  jobId: string;
  status: ProcessingStatusData | null;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ jobId, status }) => {
  if (!status) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading status...</span>
      </div>
    );
  }

  const getStatusIcon = (fileStatus: string) => {
    switch (fileStatus) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'queued':
      default:
        return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusColor = (fileStatus: string) => {
    switch (fileStatus) {
      case 'completed':
        return 'text-emerald-600 bg-emerald-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'queued':
      default:
        return 'text-amber-600 bg-amber-50';
    }
  };

  const progressPercentage = status.total_files > 0 
    ? Math.round((status.completed_files / status.total_files) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Processing Status</h3>
        <p className="text-slate-600 text-sm">Job ID: {jobId}</p>
      </div>

      {/* Overall Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            Progress ({status.completed_files}/{status.total_files})
          </span>
          <span className="text-sm font-medium text-slate-700">
            {progressPercentage}%
          </span>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status.status)}`}>
          {getStatusIcon(status.status)}
          <span className="ml-2 capitalize">{status.status}</span>
        </div>
      </div>

      {/* File Details */}
      <div className="space-y-3">
        <h4 className="font-medium text-slate-900">Files</h4>
        
        <div className="space-y-2">
          {status.files.map((file, index) => (
            <div
              key={`${file.filename}-${index}`}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(file.status)}
                <div>
                  <p className="font-medium text-slate-900">{file.filename}</p>
                  {file.error && (
                    <p className="text-sm text-red-600">{file.error}</p>
                  )}
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                {file.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timestamps */}
      <div className="text-xs text-slate-500 border-t border-slate-200 pt-4">
        <p>Started: {new Date(status.started_at).toLocaleString()}</p>
        {status.completed_at && (
          <p>Completed: {new Date(status.completed_at).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
};
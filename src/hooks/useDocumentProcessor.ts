import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

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

interface ProcessedFile {
  plain_english: string;
  summary: string;
}

const API_BASE_URL = 'http://localhost:8000';

export const useDocumentProcessor = () => {
  const [currentJob, setCurrentJob] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatusData | null>(null);
  const [processedFiles, setProcessedFiles] = useState<Record<string, ProcessedFile>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const uploadDocuments = useCallback(async (
    files: File[], 
    metadata?: { titles?: string[]; sections?: string[] }
  ) => {
    try {
      setIsProcessing(true);
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Add metadata if provided
      if (metadata?.titles) {
        metadata.titles.forEach(title => {
          formData.append('titles', title);
        });
      }
      
      if (metadata?.sections) {
        metadata.sections.forEach(section => {
          formData.append('sections', section);
        });
      }

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { job_id } = response.data;
      setCurrentJob(job_id);
      
      // Start polling for status
      pollStatus(job_id);
      
    } catch (error) {
      console.error('Upload error:', error);
      setIsProcessing(false);
      alert('Upload failed. Please try again.');
    }
  }, []);

  const pollStatus = useCallback(async (jobId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/status/${jobId}`);
      const status = response.data;
      
      setProcessingStatus(status);
      
      // Update processed files when files are completed
      const completedFiles: Record<string, ProcessedFile> = {};
      status.files.forEach((file: FileStatus) => {
        if (file.status === 'completed' && file.file_id) {
          completedFiles[file.file_id] = {
            plain_english: `${API_BASE_URL}/download/${file.file_id}/plain`,
            summary: `${API_BASE_URL}/download/${file.file_id}/summary`
          };
        }
      });
      
      setProcessedFiles(prev => ({ ...prev, ...completedFiles }));
      
      // Continue polling if still processing
      if (status.status === 'processing' || status.status === 'queued') {
        setTimeout(() => pollStatus(jobId), 2000); // Poll every 2 seconds
      } else {
        setIsProcessing(false);
      }
      
    } catch (error) {
      console.error('Status polling error:', error);
      setIsProcessing(false);
    }
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      setIsProcessing(false);
    };
  }, []);

  return {
    currentJob,
    processingStatus,
    processedFiles,
    uploadDocuments,
    isProcessing
  };
};
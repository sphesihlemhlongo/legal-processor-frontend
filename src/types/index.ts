export interface DocumentMetadata {
  title?: string;
  sections?: string;
  originalFilename: string;
  fileId: string;
}

export interface ProcessingJob {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  file_count: number;
}

export interface FileProcessingStatus {
  filename: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  error?: string;
  file_id?: string;
}

export interface JobStatus {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  files: FileProcessingStatus[];
  total_files: number;
  completed_files: number;
  started_at: string;
  completed_at?: string;
  error?: string;
}

export interface ProcessedFileUrls {
  plain_english: string;
  summary: string;
}
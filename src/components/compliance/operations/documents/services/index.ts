export * from './documentVerificationService';
export * from './documentStorage';
export * from './fileTransformationService';
export * from './filePreviewService';
export * from './batchUploadService';
export * from './thumbnailService';
export * from './supabaseStorage';

// Explicitly re-export from fileTypes to avoid ambiguity with filePreviewService
export type {
  FileTypeConfig,
  ResizeOptions,
  CompressOptions,
  ConvertOptions,
  WatermarkOptions, 
  RotateOptions,
  CropOptions,
  TransformationOptions,
  PreviewOptions as FilePreviewOptions
} from './fileTypes';
import { ObjectId } from 'mongodb';

export interface Document {
  _id: ObjectId;
  citizenEmail: string;
  documentType: string;
  type: string;
  name: string;
  url: string;
  publicId: string;
  size: number;
  status: 'active' | 'deleted' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    fileName: string;
    fileUrl: string;
    publicId: string;
    fileType: string;
    size: number;
  };
}

export interface DocumentUploadError {
  success: false;
  error: string;
  details?: string;
} 
export enum RequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export enum RequestType {
  IDENTITY_CARD = 'IDENTITY_CARD',
  RESIDENCE_CERTIFICATE = 'RESIDENCE_CERTIFICATE',
  BIRTH_CERTIFICATE = 'BIRTH_CERTIFICATE',
  MARRIAGE_CERTIFICATE = 'MARRIAGE_CERTIFICATE',
  OTHER = 'OTHER'
}

export interface Request {
  _id?: string;
  userId: string;
  type: RequestType;
  status: RequestStatus;
  description: string;
  documents?: string[];
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  comments?: {
    userId: string;
    content: string;
    createdAt: Date;
  }[];
} 
import React, { useState } from 'react';
import { Upload, Button, message, Progress } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { useSession } from 'next-auth/react';
import type { DocumentUploadResponse } from '@/types/document';

interface FileUploadProps {
  documentType: string;
  onUploadSuccess?: (fileData: DocumentUploadResponse['data']) => void;
  onUploadError?: (error: any) => void;
  maxSize?: number; // en MB
  accept?: string;
  maxCount?: number;
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  documentType,
  onUploadSuccess,
  onUploadError,
  maxSize = 2,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxCount = 1,
  value,
  onChange
}) => {
  const { data: session } = useSession();
  const [fileList, setFileList] = useState<UploadFile[]>(value || []);
  const [uploading, setUploading] = useState(false);

  const handleChange: UploadProps['onChange'] = (info) => {
    const newFileList = [...info.fileList];
    setFileList(newFileList);
    onChange?.(newFileList);

    if (info.file.status === 'uploading') {
      setUploading(true);
    }

    if (info.file.status === 'done') {
      setUploading(false);
      message.success(`${info.file.name} fichier téléchargé avec succès`);
      if (onUploadSuccess && info.file.response?.data) {
        onUploadSuccess(info.file.response.data);
      }
    } else if (info.file.status === 'error') {
      setUploading(false);
      message.error(`${info.file.name} échec du téléchargement`);
      if (onUploadError) {
        onUploadError(info.file.error);
      }
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      authorization: `Bearer ${session?.user?.email}`,
    },
    data: {
      documentType,
    },
    fileList,
    maxCount,
    accept,
    beforeUpload: (file) => {
      const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
      if (!isLtMaxSize) {
        message.error(`Le fichier doit être inférieur à ${maxSize}MB!`);
        return false;
      }
      return true;
    },
    onChange: handleChange,
    onRemove: (file) => {
      const newFileList = fileList.filter((item) => item.uid !== file.uid);
      setFileList(newFileList);
      onChange?.(newFileList);
    },
  };

  return (
    <div className="file-upload-container">
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />} loading={uploading}>
          Sélectionner un fichier
        </Button>
      </Upload>
      {uploading && (
        <Progress
          percent={99}
          status="active"
          strokeColor={{ from: '#108ee9', to: '#87d068' }}
        />
      )}
      <div className="text-sm text-gray-500 mt-2">
        Formats acceptés: {accept} (max {maxSize}MB)
      </div>
    </div>
  );
};

export default FileUpload; 
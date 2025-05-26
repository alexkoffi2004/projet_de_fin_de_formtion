'use client';

import React, { useState } from 'react';
import { Card, message } from 'antd';
import FileUpload from '@/components/FileUpload';
import type { DocumentUploadResponse } from '@/types/document';

export default function TestUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<DocumentUploadResponse['data'][]>([]);

  const handleUploadSuccess = (fileData: DocumentUploadResponse['data']) => {
    console.log('Fichier uploadé avec succès:', fileData);
    setUploadedFiles(prev => [...prev, fileData]);
    message.success('Fichier uploadé avec succès !');
  };

  const handleUploadError = (error: any) => {
    console.error('Erreur lors de l\'upload:', error);
    message.error('Erreur lors de l\'upload du fichier');
  };

  return (
    <div className="container mx-auto p-4">
      <Card title="Test d'Upload de Fichiers">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Test Upload Pièce d'Identité</h3>
            <FileUpload
              documentType="id_proof"
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              maxSize={2}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Test Upload Document</h3>
            <FileUpload
              documentType="document"
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              maxSize={2}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Fichiers Uploadés</h3>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="p-2 border rounded">
                    <p><strong>Nom:</strong> {file.fileName}</p>
                    <p><strong>Type:</strong> {file.fileType}</p>
                    <p><strong>Taille:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>URL:</strong> <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">{file.fileUrl}</a></p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 
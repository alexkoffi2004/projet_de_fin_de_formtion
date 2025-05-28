"use client";

import React, { useEffect, useState } from 'react';
import { Card, Typography, Descriptions, Tag, Button, Space, message, Alert } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { CitizenLayout } from '@/components/layouts/citizen-layout';

const { Title } = Typography;

interface Document {
  id: string;
  type: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentDetails {
  id: string;
  documentType: 'birth_certificate' | 'birth_declaration';
  fullName: string;
  birthDate: Date;
  birthPlace: string;
  fatherFullName?: string;
  motherFullName?: string;
  status: string;
  trackingNumber: string;
  rejectReason?: string;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  files: Document[];
}

const DocumentDetailsPage = ({ params }: { params: { id: string } }) => {
  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDocumentDetails();
  }, [params.id]);

  const fetchDocumentDetails = async () => {
    try {
      const response = await fetch(`/api/citizen/documents/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setDocument(data.data);
      } else {
        message.error(data.message || 'Erreur lors de la récupération des détails');
      }
    } catch (error) {
      console.error('Error fetching document details:', error);
      message.error('Erreur lors de la récupération des détails');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      en_attente: 'orange',
      approuvé: 'green',
      rejeté: 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts = {
      en_attente: 'En attente',
      approuvé: 'Approuvé',
      rejeté: 'Rejeté'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'birth_certificate':
        return "Acte de naissance";
      case 'birth_declaration':
        return "Déclaration de naissance";
      default:
        return type;
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!document) {
    return <div>Document non trouvé</div>;
  }

  return (
    <CitizenLayout>
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.push('/citizen/documents')}
          >
            Retour à la liste
          </Button>

          <Card title="Détails de la demande">
            <Descriptions bordered>
              <Descriptions.Item label="Type de document" span={3}>
                {getDocumentTypeLabel(document.documentType)}
              </Descriptions.Item>
              <Descriptions.Item label="Numéro de suivi" span={3}>
                {document.trackingNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Statut">
                <Tag color={getStatusColor(document.status)}>
                  {getStatusText(document.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Date de la demande">
                {new Date(document.createdAt).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Dernière mise à jour">
                {new Date(document.updatedAt).toLocaleDateString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Informations du document">
            <Descriptions bordered>
              <Descriptions.Item label="Nom complet" span={3}>
                {document.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Date de naissance">
                {new Date(document.birthDate).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Lieu de naissance" span={2}>
                {document.birthPlace}
              </Descriptions.Item>
              <Descriptions.Item label="Nom du père">
                {document.fatherFullName || 'Non renseigné'}
              </Descriptions.Item>
              <Descriptions.Item label="Nom de la mère">
                {document.motherFullName || 'Non renseigné'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {document.status === 'rejeté' && document.comment && (
            <Card title="Motif du rejet">
              <Alert
                message="Votre demande a été rejetée"
                description={document.comment}
                type="error"
                showIcon
              />
            </Card>
          )}

          <Card title="Documents fournis">
            <Space direction="vertical" style={{ width: '100%' }}>
              {document.files.map((file) => (
                <Card key={file.id} size="small" style={{ marginBottom: '16px' }}>
                  <Space align="start">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                        {file.type === 'DEMANDEUR_ID' ? 'Pièce d\'identité du demandeur' : 
                         file.type === 'EXISTING_ACTE' ? 'Acte existant' : 
                         file.type === 'ACTE_NAISSANCE_FINAL' ? 'Acte de naissance final' : 
                         file.type}
                      </div>
                      <Space>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          <Button icon={<DownloadOutlined />}>Télécharger</Button>
                        </a>
                        {(file.type === 'DEMANDEUR_ID' || file.type === 'EXISTING_ACTE') && (
                          <Button onClick={() => window.open(file.url, '_blank')}>
                            Voir le document
                          </Button>
                        )}
                      </Space>
                    </div>
                  </Space>
                </Card>
              ))}
            </Space>
          </Card>

          {document.status === 'approuvé' && document.files.some(file => file.type === 'ACTE_NAISSANCE_FINAL') && (
            <Card title="Document final">
              <Alert
                message="Votre document est prêt"
                description={
                  <div>
                    <p>Votre document a été validé et est disponible en téléchargement.</p>
                    <Button 
                      type="primary" 
                      icon={<DownloadOutlined />}
                      style={{ marginTop: '16px' }}
                      onClick={() => {
                        const finalDocument = document.files.find(file => file.type === 'ACTE_NAISSANCE_FINAL');
                        if (finalDocument) {
                          window.open(finalDocument.url, '_blank');
                        }
                      }}
                    >
                      Télécharger le document final
                    </Button>
                  </div>
                }
                type="success"
                showIcon
              />
            </Card>
          )}
        </Space>
      </div>
    </CitizenLayout>
  );
};

export default DocumentDetailsPage; 
"use client";

import React, { useEffect, useState } from 'react';
import { Card, Typography, Descriptions, Tag, Timeline, Button, Space, message, Modal, Input, Image } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { AgentLayout } from '@/components/layouts/agent-layout';

const { Title } = Typography;
const { TextArea } = Input;

interface Document {
  id: string;
  type: string;
  url: string;
}

interface BirthCertificateRequest {
  id: string;
  fullName: string;
  birthDate: Date;
  birthPlace: string;
  fatherFullName?: string;
  motherFullName?: string;
  status: string;
  trackingNumber: string;
  createdAt: Date;
  updatedAt: Date;
  comment?: string;
  citizen: {
    name: string;
    email: string;
  };
  files: Document[];
}

const BirthCertificateDetails = ({ params }: { params: { id: string } }) => {
  const [request, setRequest] = useState<BirthCertificateRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [comment, setComment] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRequestDetails();
  }, [params.id]);

  const fetchRequestDetails = async () => {
    try {
      const response = await fetch(`/api/agent/birth-certificates/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setRequest(data.data);
        setComment(data.data.comment || '');
      } else {
        message.error(data.message || 'Erreur lors de la récupération des détails');
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      message.error('Erreur lors de la récupération des détails');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/agent/birth-certificates?id=${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          comment: comment,
        }),
      });

      const data = await response.json();
      if (data.success) {
        message.success('Statut mis à jour avec succès');
        fetchRequestDetails();
        setIsModalVisible(false);
      } else {
        message.error(data.message || 'Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      message.error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'orange',
      IN_PROGRESS: 'blue',
      COMPLETED: 'green',
      REJECTED: 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts = {
      PENDING: 'En attente',
      IN_PROGRESS: 'En cours',
      COMPLETED: 'Complété',
      REJECTED: 'Rejeté'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleOk = async () => {
    const newStatus = request?.status === 'PENDING' ? 'COMPLETED' : 'REJECTED';
    setUpdating(true);

    if (newStatus === 'COMPLETED') {
      if (!selectedFile) {
        message.warning('Veuillez joindre le document final pour valider la demande.');
        setUpdating(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const uploadResponse = await fetch(`/api/agent/birth-certificates/${params.id}/upload-final-document`, {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadData.success) {
          message.error(uploadData.message || 'Erreur lors du téléversement du document final.');
          setUpdating(false);
          return;
        }

        await updateRequestStatus(newStatus);

      } catch (error) {
        console.error('Error uploading final document:', error);
        message.error('Erreur lors du téléversement du document final.');
        setUpdating(false);
      }

    } else {
      await updateRequestStatus(newStatus);
    }
  };

  const showModal = (statusToUpdate: 'COMPLETED' | 'REJECTED') => {
    if (statusToUpdate === 'COMPLETED') {
      setSelectedFile(null);
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setComment('');
    setSelectedFile(null);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!request) {
    return <div>Demande non trouvée</div>;
  }

  return (
    <AgentLayout>
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.push('/agent/birth-certificates')}
          >
            Retour à la liste
          </Button>

          <Card title="Détails de la demande">
            <Descriptions bordered>
              <Descriptions.Item label="Numéro de suivi" span={3}>
                {request.trackingNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Nom complet" span={3}>
                {request.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Date de naissance">
                {new Date(request.birthDate).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Lieu de naissance" span={2}>
                {request.birthPlace}
              </Descriptions.Item>
              <Descriptions.Item label="Nom du père">
                {request.fatherFullName || 'Non renseigné'}
              </Descriptions.Item>
              <Descriptions.Item label="Nom de la mère">
                {request.motherFullName || 'Non renseigné'}
              </Descriptions.Item>
              <Descriptions.Item label="Statut">
                <Tag color={getStatusColor(request.status)}>
                  {getStatusText(request.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Commentaire" span={3}>
                {request.comment || 'Aucun commentaire'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Documents fournis">
            <Space direction="vertical" style={{ width: '100%' }}>
              {request.files.map((file) => (
                <Card key={file.id} size="small">
                  <Space>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>
                        {file.type === 'id_proof' ? 'Pièce d\'identité' : 
                         file.type === 'existing_acte' ? 'Acte existant' : 
                         file.type === 'acte_naissance_final' ? 'Acte de naissance final' : 
                         file.type}
                      </div>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <Button icon={<DownloadOutlined />}>Télécharger</Button>
                      </a>
                    </div>
                    {file.type === 'id_proof' && (
                      <Image
                        src={file.url}
                        alt="Pièce d'identité"
                        style={{ maxWidth: '200px', maxHeight: '200px' }}
                      />
                    )}
                  </Space>
                </Card>
              ))}
            </Space>
          </Card>

          {request.status === 'PENDING' && (
            <Card title="Actions">
              <Space>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => showModal('COMPLETED')}
                >
                  Valider la demande
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => showModal('REJECTED')}
                >
                  Rejeter la demande
                </Button>
              </Space>
            </Card>
          )}

          <Modal
            title={request.status === 'PENDING' ? 'Valider la demande' : 'Rejeter la demande'}
            open={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={updating}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <TextArea
                rows={4}
                placeholder="Ajouter un commentaire (optionnel)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              {request.status === 'PENDING' && (
                <div>
                  <p>Joindre le document final :</p>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              )}
            </Space>
          </Modal>
        </Space>
      </div>
    </AgentLayout>
  );
};

export default BirthCertificateDetails; 
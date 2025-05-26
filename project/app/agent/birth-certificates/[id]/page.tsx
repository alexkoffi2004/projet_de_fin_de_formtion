"use client";

import React, { useEffect, useState } from 'react';
import { Card, Typography, Descriptions, Tag, Timeline, Button, Space, message, Modal, Input } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { AgentLayout } from '@/components/layouts/agent-layout';

const { Title } = Typography;
const { TextArea } = Input;

interface DocumentFile {
  id: string;
  type: string;
  url: string;
}

interface BirthCertificateRequest {
  id: string;
  fullName: string;
  birthDate: string;
  birthPlace: string;
  fatherFullName?: string;
  motherFullName?: string;
  status: string;
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
  comment?: string;
  citizen: {
    name: string;
    email: string;
  };
  files: DocumentFile[];
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

  const updateRequestStatus = async (newStatus: string, fileUrl?: string, fileType?: string) => {
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
          // We are now handling file upload separately via a dedicated endpoint
          // No need to send file info here anymore
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

  const getTimelineItems = () => {
    if (!request) return [];
    
    const items = [
      {
        color: 'green',
        children: `Demande créée le ${new Date(request.createdAt).toLocaleDateString()}`
      }
    ];

    if (request.status === 'IN_PROGRESS') {
      items.push({
        color: 'blue',
        children: `En cours de traitement`
      });
    } else if (request.status === 'COMPLETED') {
      items.push({
        color: 'green',
        children: `Demande complétée le ${new Date(request.updatedAt).toLocaleDateString()}`
      });
    } else if (request.status === 'REJECTED') {
      items.push({
        color: 'red',
        children: `Demande rejetée le ${new Date(request.updatedAt).toLocaleDateString()}`
      });
    }

    return items;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleOk = async () => {
    const newStatus = request?.status === 'PENDING' ? 'COMPLETED' : 'REJECTED';
    setUpdating(true); // Start updating process

    if (newStatus === 'COMPLETED') {
      if (!selectedFile) {
        message.warning('Veuillez joindre le document final pour valider la demande.');
        setUpdating(false); // Stop updating on warning
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
          setUpdating(false); // Stop updating on upload error
          return;
        }

        // If upload is successful, then update the request status to COMPLETED
        await updateRequestStatus(newStatus);

      } catch (error) {
        console.error('Error uploading final document:', error);
        message.error('Erreur lors du téléversement du document final.');
        setUpdating(false); // Stop updating on catch error
      }

    } else {
      // If rejecting, just update status without file upload
      await updateRequestStatus(newStatus);
    }
  };

  const showModal = (statusToUpdate: 'COMPLETED' | 'REJECTED') => {
    // Reset file selection only if opening modal for COMPLETED status
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

          <Card title="Informations du demandeur">
            <Descriptions bordered>
              <Descriptions.Item label="Nom">
                {request.citizen.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {request.citizen.email}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Suivi de la demande">
            <Timeline items={getTimelineItems()} />
          </Card>

          {request.status === 'PENDING' && (
            <Space>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => showModal('COMPLETED')}
                loading={updating}
              >
                Valider la demande
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => showModal('REJECTED')}
                loading={updating}
              >
                Rejeter la demande
              </Button>
            </Space>
          )}

          <Modal
            title="Confirmation"
            open={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={updating}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <p>Êtes-vous sûr de vouloir {request?.status === 'PENDING' ? 'valider' : 'rejeter'} cette demande ?</p>
              {request?.status === 'PENDING' && (
                <>
                  <p>Joindre le document final :</p>
                  <Input 
                    type="file" 
                    onChange={handleFileChange} 
                    accept=".pdf,.doc,.docx,.jpg,.png"
                  />
                </>
              )}
              <TextArea
                rows={4}
                placeholder="Ajouter un commentaire (optionnel)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Space>
          </Modal>
        </Space>
      </div>
    </AgentLayout>
  );
};

export default BirthCertificateDetails; 
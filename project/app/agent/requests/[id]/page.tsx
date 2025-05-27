"use client";

import React, { useEffect, useState } from 'react';
import { Card, Typography, Descriptions, Tag, Timeline, Button, Space, message } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

interface RequestDetails {
  id: string;
  childName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  gender: string;
  fatherName: string;
  motherName: string;
  status: string;
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
  documents: {
    birthCertificate: string;
    familyBook: string | null;
  };
  payment: {
    amount: number;
    method: string;
    status: string;
  };
  citizen: {
    name: string;
    email: string;
  };
}

const RequestDetails = ({ params }: { params: { id: string } }) => {
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchRequestDetails();
  }, [params.id]);

  const fetchRequestDetails = async () => {
    try {
      const response = await fetch(`/api/agent/requests/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setRequest(data.data);
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/agent/requests/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        message.success('Statut mis à jour avec succès');
        fetchRequestDetails();
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
      en_attente: 'orange',
      en_cours: 'blue',
      complété: 'green',
      rejeté: 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts = {
      en_attente: 'En attente',
      en_cours: 'En cours',
      complété: 'Complété',
      rejeté: 'Rejeté'
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

    if (request.status === 'en_cours') {
      items.push({
        color: 'blue',
        children: `En cours de traitement`
      });
    } else if (request.status === 'complété') {
      items.push({
        color: 'green',
        children: `Demande complétée le ${new Date(request.updatedAt).toLocaleDateString()}`
      });
    } else if (request.status === 'rejeté') {
      items.push({
        color: 'red',
        children: `Demande rejetée le ${new Date(request.updatedAt).toLocaleDateString()}`
      });
    }

    return items;
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!request) {
    return <div>Demande non trouvée</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
          >
            Retour
          </Button>
          <Title level={2}>Détails de la demande</Title>
        </Space>

        <Card>
          <Descriptions title="Informations de base" bordered>
            <Descriptions.Item label="Numéro de suivi">
              {request.trackingNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Statut">
              <Tag color={getStatusColor(request.status)}>
                {getStatusText(request.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Date de création">
              {new Date(request.createdAt).toLocaleDateString()}
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

        <Card title="Informations de l'enfant">
          <Descriptions bordered>
            <Descriptions.Item label="Nom complet">
              {request.childName}
            </Descriptions.Item>
            <Descriptions.Item label="Date de naissance">
              {new Date(request.birthDate).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Heure de naissance">
              {request.birthTime}
            </Descriptions.Item>
            <Descriptions.Item label="Lieu de naissance">
              {request.birthPlace}
            </Descriptions.Item>
            <Descriptions.Item label="Genre">
              {request.gender === 'MALE' ? 'Masculin' : 'Féminin'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Informations des parents">
          <Descriptions bordered>
            <Descriptions.Item label="Nom du père">
              {request.fatherName}
            </Descriptions.Item>
            <Descriptions.Item label="Nom de la mère">
              {request.motherName}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Documents">
          <Descriptions bordered>
            <Descriptions.Item label="Acte de naissance">
              <Button
                type="link"
                onClick={() => window.open(request.documents.birthCertificate, '_blank')}
              >
                Voir le document
              </Button>
            </Descriptions.Item>
            {request.documents.familyBook && (
              <Descriptions.Item label="Livre de famille">
                <Button
                  type="link"
                  onClick={() => window.open(request.documents.familyBook!, '_blank')}
                >
                  Voir le document
                </Button>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        <Card title="Paiement">
          <Descriptions bordered>
            <Descriptions.Item label="Montant">
              {request.payment.amount} FCFA
            </Descriptions.Item>
            <Descriptions.Item label="Méthode">
              {request.payment.method}
            </Descriptions.Item>
            <Descriptions.Item label="Statut">
              <Tag color={request.payment.status === 'PAID' ? 'green' : 'red'}>
                {request.payment.status === 'PAID' ? 'Payé' : 'Non payé'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Suivi de la demande">
          <Timeline items={getTimelineItems()} />
        </Card>

        {request.status === 'en_attente' && (
          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => updateRequestStatus('en_cours')}
              loading={updating}
            >
              Prendre en charge
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => updateRequestStatus('rejeté')}
              loading={updating}
            >
              Rejeter
            </Button>
          </Space>
        )}

        {request.status === 'en_cours' && (
          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => updateRequestStatus('complété')}
              loading={updating}
            >
              Valider
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => updateRequestStatus('rejeté')}
              loading={updating}
            >
              Rejeter
            </Button>
          </Space>
        )}
      </Space>
    </div>
  );
};

export default RequestDetails; 
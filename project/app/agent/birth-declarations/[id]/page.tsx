"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, Typography, Descriptions, Tag, Button, Space, message } from 'antd';
import { AgentLayout } from '@/components/layouts/agent-layout';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface BirthDeclaration {
  id: string;
  childFirstName: string;
  childLastName: string;
  birthDate: Date;
  birthPlace: string;
  gender: string;
  status: string;
  createdAt: string;
  citizen: {
    name: string;
    email: string;
  };
  documents: {
    type: string;
    url: string;
  }[];
  payment: {
    status: string;
    amount: number;
  } | null;
}

export default function BirthDeclarationDetailsPage() {
  const { id } = useParams();
  const [declaration, setDeclaration] = useState<BirthDeclaration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeclarationDetails();
  }, [id]);

  const fetchDeclarationDetails = async () => {
    try {
      const response = await fetch(`/api/agent/birth-declarations/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setDeclaration(data.data);
      } else {
        message.error('Erreur lors de la récupération des détails');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/agent/birth-declarations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      
      if (data.success) {
        message.success('Statut mis à jour avec succès');
        fetchDeclarationDetails();
      } else {
        message.error('Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Une erreur est survenue');
    }
  };

  if (loading) {
    return (
      <AgentLayout>
        <div className="container mx-auto px-4 py-8">
          <Card loading={true} />
        </div>
      </AgentLayout>
    );
  }

  if (!declaration) {
    return (
      <AgentLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <Title level={2}>Déclaration non trouvée</Title>
          </Card>
        </div>
      </AgentLayout>
    );
  }

  return (
    <AgentLayout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <Title level={2}>Détails de la Déclaration de Naissance</Title>
          
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Statut">
              <Tag color={
                declaration.status === 'en_attente' ? 'orange' :
                declaration.status === 'approuvé' ? 'green' :
                declaration.status === 'rejeté' ? 'red' : 'default'
              }>
                {declaration.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Date de demande">
              {new Date(declaration.createdAt).toLocaleDateString()}
            </Descriptions.Item>
            
            <Descriptions.Item label="Nom de l'enfant">
              {`${declaration.childFirstName} ${declaration.childLastName}`}
            </Descriptions.Item>
            <Descriptions.Item label="Date de naissance">
              {new Date(declaration.birthDate).toLocaleDateString()}
            </Descriptions.Item>
            
            <Descriptions.Item label="Lieu de naissance">
              {declaration.birthPlace}
            </Descriptions.Item>
            <Descriptions.Item label="Genre">
              {declaration.gender}
            </Descriptions.Item>

            <Descriptions.Item label="Demandeur">
              {declaration.citizen.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {declaration.citizen.email}
            </Descriptions.Item>
            
            <Descriptions.Item label="Paiement">
              {declaration.payment ? (
                <Tag color={declaration.payment.status === 'completed' ? 'green' : 'orange'}>
                  {declaration.payment.status === 'completed' ? 'Payé' : 'En attente'} - {declaration.payment.amount}€
                </Tag>
              ) : (
                <Tag color="red">Non payé</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>

          <div className="mt-8">
            <Title level={4}>Documents</Title>
            <div className="grid grid-cols-2 gap-4">
              {declaration.documents.map((doc, index) => (
                <Card key={index} size="small">
                  <p className="font-semibold">{doc.type}</p>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    Voir le document
                  </a>
                </Card>
              ))}
            </div>
          </div>

          {declaration.status === 'en_attente' && (
            <div className="mt-8 flex justify-end space-x-4">
              <Button
                type="primary"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleStatusUpdate('rejeté')}
              >
                Rejeter
              </Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleStatusUpdate('approuvé')}
              >
                Approuver
              </Button>
            </div>
          )}
        </Card>
      </div>
    </AgentLayout>
  );
} 
"use client";

import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Typography, Space, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { AgentLayout } from '@/components/layouts/agent-layout';

const { Title } = Typography;

interface BirthDeclaration {
  id: string;
  childFirstName: string;
  childLastName: string;
  birthDate: Date;
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
}

export default function BirthDeclarationsPage() {
  const [declarations, setDeclarations] = useState<BirthDeclaration[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDeclarations();
    
    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(() => {
      fetchDeclarations();
    }, 30000);

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(interval);
  }, []);

  const fetchDeclarations = async () => {
    try {
      const response = await fetch('/api/agent/birth-declarations');
      const data = await response.json();
      
      if (data.success) {
        setDeclarations(data.data);
      } else {
        console.error('Erreur lors de la récupération des déclarations');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Nom de l\'enfant',
      dataIndex: 'childFirstName',
      key: 'childFirstName',
      render: (_: any, record: BirthDeclaration) => 
        `${record.childFirstName} ${record.childLastName}`,
    },
    {
      title: 'Date de naissance',
      dataIndex: 'birthDate',
      key: 'birthDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Demandeur',
      dataIndex: 'citizen',
      key: 'citizen',
      render: (citizen: { name: string; email: string }) => 
        `${citizen.name} (${citizen.email})`,
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'en_attente' ? 'orange' :
          status === 'approuvé' ? 'green' :
          status === 'rejeté' ? 'red' : 'default'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Date de demande',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: BirthDeclaration) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/agent/birth-declarations/${record.id}`)}
          >
            Voir détails
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AgentLayout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <Title level={2}>Déclarations de Naissance</Title>
          <Table
            columns={columns}
            dataSource={declarations}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} déclarations`,
            }}
          />
        </Card>
      </div>
    </AgentLayout>
  );
} 
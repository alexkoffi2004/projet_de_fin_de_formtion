"use client";

import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Typography, Space, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

interface BirthDeclaration {
  id: string;
  childName: string;
  birthDate: string;
  status: string;
  trackingNumber: string;
  createdAt: string;
}

const CitizenRequests = () => {
  const [requests, setRequests] = useState<BirthDeclaration[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/citizen/requests');
      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
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

  const columns = [
    {
      title: 'Numéro de suivi',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
    },
    {
      title: 'Nom de l\'enfant',
      dataIndex: 'childName',
      key: 'childName',
    },
    {
      title: 'Date de naissance',
      dataIndex: 'birthDate',
      key: 'birthDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
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
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/citizen/requests/${record.id}`)}
        >
          Voir détails
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Mes demandes</Title>
      <Card>
        <Table
          columns={columns}
          dataSource={requests}
          loading={loading}
          rowKey="id"
        />
      </Card>
    </div>
  );
};

export default CitizenRequests; 
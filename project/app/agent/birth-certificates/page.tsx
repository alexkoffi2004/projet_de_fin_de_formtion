"use client";

import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Typography, Space, Button, Select, Input, message } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { AgentLayout } from '@/components/layouts/agent-layout';

const { Title } = Typography;
const { Option } = Select;

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
  citizen: {
    name: string;
    email: string;
  };
  files: {
    demandeurIdProof: string;
    existingActe?: string;
  };
}

const BirthCertificateRequests = () => {
  const [requests, setRequests] = useState<BirthCertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'ALL',
    search: ''
  });
  const router = useRouter();

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/agent/birth-certificates?status=${filters.status}&search=${filters.search}`);
      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
      } else {
        message.error(data.message || 'Erreur lors de la récupération des demandes');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      message.error('Erreur lors de la récupération des demandes');
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
      title: 'Nom complet',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Date de naissance',
      dataIndex: 'birthDate',
      key: 'birthDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Lieu de naissance',
      dataIndex: 'birthPlace',
      key: 'birthPlace',
    },
    {
      title: 'Demandeur',
      key: 'citizen',
      render: (record: BirthCertificateRequest) => (
        <div>
          <div>{record.citizen.name}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>{record.citizen.email}</div>
        </div>
      ),
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
      render: (_: any, record: BirthCertificateRequest) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/agent/birth-certificates/${record.id}`)}
        >
          Voir détails
        </Button>
      ),
    },
  ];

  return (
    <AgentLayout>
      <div style={{ padding: '24px' }}>
        <Title level={2}>Gestion des demandes d'acte de naissance</Title>
        
        <Card style={{ marginBottom: '24px' }}>
          <Space size="large">
            <Select
              style={{ width: 200 }}
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <Option value="ALL">Tous les statuts</Option>
              <Option value="PENDING">En attente</Option>
              <Option value="IN_PROGRESS">En cours</Option>
              <Option value="COMPLETED">Complété</Option>
              <Option value="REJECTED">Rejeté</Option>
            </Select>

            <Input
              placeholder="Rechercher par numéro de suivi ou nom"
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </Space>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={requests}
            loading={loading}
            rowKey="id"
          />
        </Card>
      </div>
    </AgentLayout>
  );
};

export default BirthCertificateRequests; 
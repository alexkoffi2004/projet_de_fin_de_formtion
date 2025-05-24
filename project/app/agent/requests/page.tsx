"use client";

import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Typography, Space, Button, Select, Input } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;
const { Option } = Select;

interface Request {
  id: string;
  childName: string;
  birthDate: string;
  status: string;
  trackingNumber: string;
  createdAt: string;
  citizen: {
    name: string;
    email: string;
  };
}

const AgentRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
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
      const response = await fetch(`/api/agent/requests?status=${filters.status}&search=${filters.search}`);
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
      title: 'Demandeur',
      key: 'citizen',
      render: (record: Request) => (
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
      render: (_: any, record: Request) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/agent/requests/${record.id}`)}
        >
          Voir détails
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Gestion des demandes</Title>
      
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
  );
};

export default AgentRequests; 
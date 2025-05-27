"use client";

import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Statistic, Button, Progress, Space, Divider, Badge } from 'antd';
import { 
  FileTextOutlined, 
  FileProtectOutlined, 
  FileSearchOutlined,
  FileDoneOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { AgentLayout } from '@/components/layouts/agent-layout';

const { Title, Text } = Typography;

interface DashboardStats {
  birthDeclarations: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  birthCertificates: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  documents: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  requests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export default function AgentDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    birthDeclarations: { total: 0, pending: 0, approved: 0, rejected: 0 },
    birthCertificates: { total: 0, pending: 0, approved: 0, rejected: 0 },
    documents: { total: 0, pending: 0, approved: 0, rejected: 0 },
    requests: { total: 0, pending: 0, approved: 0, rejected: 0 }
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/agent/dashboard/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      title: 'Déclarations de Naissance',
      icon: <FileTextOutlined />,
      stats: stats.birthDeclarations,
      path: '/agent/birth-declarations',
      color: '#1890ff',
      showApprovalStats: true
    },
    {
      title: 'Actes de Naissance',
      icon: <FileProtectOutlined />,
      stats: stats.birthCertificates,
      path: '/agent/documents',
      color: '#52c41a',
      showApprovalStats: true
    },
    {
      title: 'Demandes Générales',
      icon: <FileDoneOutlined />,
      stats: stats.requests,
      path: '/agent/requests',
      color: '#fa8c16',
      showApprovalStats: true
    }
  ];

  return (
    <AgentLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Title level={2} style={{ margin: 0 }}>Tableau de Bord</Title>
              <Text type="secondary">Vue d'ensemble des demandes</Text>
            </div>
            <Badge status="processing" text="En direct" />
          </div>

          <Row gutter={[24, 24]}>
            {sections.map((section, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  className="h-full hover:shadow-lg transition-all duration-300"
                  style={{ 
                    borderRadius: '12px',
                    background: 'white'
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div 
                        style={{ 
                          color: section.color,
                          backgroundColor: `${section.color}10`,
                          padding: '10px',
                          borderRadius: '8px',
                          marginRight: '12px'
                        }}
                      >
                        {section.icon}
                          </div>
                      <Title level={4} style={{ margin: 0 }}>
                        {section.title}
                      </Title>
                        </div>
                    <Badge 
                      count={section.stats.pending} 
                      style={{ 
                        backgroundColor: section.stats.pending > 0 ? '#faad14' : '#52c41a'
                      }}
                    />
                        </div>

                  <Space direction="vertical" size="large" className="w-full">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Text type="secondary" className="block mb-1">Total</Text>
                        <Title level={3} style={{ margin: 0, color: section.color }}>
                          {section.stats.total}
                        </Title>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Text type="secondary" className="block mb-1">En attente</Text>
                        <Title level={3} style={{ margin: 0, color: '#faad14' }}>
                          {section.stats.pending}
                        </Title>
                </div>
                    </div>

                    {section.showApprovalStats && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <Text type="secondary" className="block mb-1">Approuvées</Text>
                          <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                            {section.stats.approved}
                          </Title>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <Text type="secondary" className="block mb-1">Rejetées</Text>
                          <Title level={3} style={{ margin: 0, color: '#ff4d4f' }}>
                            {section.stats.rejected}
                          </Title>
                        </div>
                      </div>
                    )}

                    {section.stats.total > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Text type="secondary">Progression</Text>
                          <Text type="secondary">
                            {Math.round((section.stats.pending / section.stats.total) * 100)}%
                          </Text>
                        </div>
                        <Progress
                          percent={Math.round((section.stats.pending / section.stats.total) * 100)}
                          strokeColor={section.color}
                          showInfo={false}
                          strokeWidth={8}
                        />
                </div>
                    )}

                    <Button 
                      type="text"
                      block
                      onClick={() => router.push(section.path)}
                      className="flex items-center justify-center"
                      style={{ 
                        color: section.color,
                        height: '40px',
                        border: `1px solid ${section.color}40`,
                        borderRadius: '8px'
                      }}
                    >
                      Voir les détails
                      <ArrowRightOutlined className="ml-2" />
                    </Button>
                  </Space>
            </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </AgentLayout>
  );
} 
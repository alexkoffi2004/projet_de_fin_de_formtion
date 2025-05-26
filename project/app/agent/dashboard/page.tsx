"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart,
  Calendar,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentLayout } from "@/components/layouts/agent-layout";
import { toast } from "sonner";

interface Stats {
  totalRequests: number;
  lastMonthRequests: number;
  pendingRequests: number;
  validatedRequests: number;
  rejectedRequests: number;
  recentRequests: Array<{
    _id: string;
    documentType: string;
    status: string;
    createdAt: string;
    citizenEmail: string;
  }>;
  statsByType: Array<{
    _id: string;
    count: number;
    pending: number;
    validated: number;
    rejected: number;
  }>;
  statsByDay: Array<{
    _id: string;
    count: number;
  }>;
}

export default function AgentDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    lastMonthRequests: 0,
    pendingRequests: 0,
    validatedRequests: 0,
    rejectedRequests: 0,
    recentRequests: [],
    statsByType: [],
    statsByDay: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/agent/stats');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }
      const data = await response.json() as Stats;
      setStats(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la récupération des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_attente':
        return <Badge variant="secondary">En attente</Badge>;
      case 'valide':
        return <Badge variant="success">Validé</Badge>;
      case 'rejete':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'birth_declaration': 'Déclaration de naissance',
      'birth_certificate': 'Acte de naissance',
      'residence_certificate': 'Certificat de résidence',
      'marriage_certificate': 'Certificat de mariage',
      'criminal_record': 'Extrait de casier judiciaire',
      'id_card': 'Carte d\'identité',
      'passport': 'Passeport'
    };
    return types[type] || type;
  };

  return (
    <AgentLayout>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
              <p className="text-muted-foreground">
                Vue d'ensemble des demandes de documents
              </p>
            </div>
            <Link href="/agent/documents">
              <Button>Voir toutes les demandes</Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="animation-fadeIn">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Demandes totales
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalRequests}</div>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "..." : `+${stats.lastMonthRequests} depuis le mois dernier`}
                </p>
              </CardContent>
            </Card>
            <Card className="animation-fadeIn" style={{ animationDelay: '100ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En attente</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : stats.pendingRequests}</div>
                <p className="text-xs text-muted-foreground">
                  À traiter
                </p>
              </CardContent>
            </Card>
            <Card className="animation-fadeIn" style={{ animationDelay: '200ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Validées</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : stats.validatedRequests}</div>
                <p className="text-xs text-muted-foreground">
                  Documents délivrés
                </p>
              </CardContent>
            </Card>
            <Card className="animation-fadeIn" style={{ animationDelay: '300ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : stats.rejectedRequests}</div>
                <p className="text-xs text-muted-foreground">
                  Demandes refusées
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Demandes récentes</CardTitle>
                <CardDescription>
                  Les 5 dernières demandes reçues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-4">Chargement...</div>
                  ) : stats.recentRequests.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Aucune demande récente
                    </div>
                  ) : (
                    stats.recentRequests.map((request) => (
                      <div
                        key={request._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {getDocumentTypeLabel(request.documentType)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {request.citizenEmail}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {getStatusBadge(request.status)}
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/agent/document/${request._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Statistiques par type</CardTitle>
                <CardDescription>
                  Répartition des demandes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-4">Chargement...</div>
                  ) : !stats || Object.keys(stats).length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Aucune donnée disponible
                    </div>
                  ) : (
                    stats.statsByType.map((stat) => (
                      <div
                        key={stat._id}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            {getDocumentTypeLabel(stat._id)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {stat.count} demandes
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center p-2 bg-muted rounded">
                            <p className="font-medium">{stat.pending}</p>
                            <p className="text-xs text-muted-foreground">En attente</p>
                          </div>
                          <div className="text-center p-2 bg-muted rounded">
                            <p className="font-medium">{stat.validated}</p>
                            <p className="text-xs text-muted-foreground">Validées</p>
                          </div>
                          <div className="text-center p-2 bg-muted rounded">
                            <p className="font-medium">{stat.rejected}</p>
                            <p className="text-xs text-muted-foreground">Rejetées</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AgentLayout>
  );
} 
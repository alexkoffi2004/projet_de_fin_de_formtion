"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, 
  PlusCircle, 
  Bell,  
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  Search,
  Download,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CitizenLayout } from "@/components/layouts/citizen-layout";
import { toast } from "sonner";

interface DocumentFile {
  id: string;
  type: string;
  url: string;
}

interface CitizenRequest {
  _id: string;
  documentType: string;
  status: string;
  createdAt: string;
  trackingNumber?: string;
  files?: DocumentFile[];
}

interface Stats {
  totalRequests: number;
  lastMonthRequests: number;
  pendingRequests: number;
  validatedRequests: number;
  rejectedRequests: number;
  recentRequests: CitizenRequest[];
}

export default function CitizenDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    lastMonthRequests: 0,
    pendingRequests: 0,
    validatedRequests: 0,
    rejectedRequests: 0,
    recentRequests: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/citizen/stats');
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en_attente':
        return 'En attente de validation';
      case 'valide':
        return 'Document validé et disponible';
      case 'rejete':
        return 'Demande rejetée';
      default:
        return status;
    }
  };

  const filteredRequests = stats.recentRequests.filter(request => {
    const matchesSearch = 
      (request.documentType ? getDocumentTypeLabel(request.documentType).toLowerCase() : '').includes(searchTerm.toLowerCase()) ||
      request._id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && request.status === activeTab;
  });

  return (
    <CitizenLayout>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
            <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
            <div className="flex items-center space-x-2">
              <Link href="/citizen/document/new">
                <Button className="flex items-center">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nouvelle demande
                </Button>
              </Link>
            </div>
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
                  Réponse prévue sous 48h
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
                  {isLoading ? "..." : `+${stats.lastMonthRequests} depuis le mois dernier`}
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
                  Aucun changement depuis le mois dernier
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Mes demandes</CardTitle>
                    <CardDescription>
                      Historique de vos demandes de documents
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      className="w-[200px]"
                    />
                  </div>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">Tous</TabsTrigger>
                    <TabsTrigger value="pending">En attente</TabsTrigger>
                    <TabsTrigger value="validated">Validés</TabsTrigger>
                    <TabsTrigger value="rejected">Rejetés</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-4">Chargement...</div>
                  ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Aucune demande trouvée
                    </div>
                  ) : (
                    filteredRequests.map((request) => (
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
                            {request.trackingNumber && (
                              <p className="text-sm text-muted-foreground">
                                N° suivi: {request.trackingNumber}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              Demandé le: {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {getStatusBadge(request.status)}
                          {request.status === 'valide' && request.files && request.files.length > 0 && (
                            (() => {
                              const finalDocument = request.files.find(file => file.type === 'acte_naissance_final');
                              if (finalDocument) {
                                return (
                                  <Button variant="ghost" size="icon" asChild>
                                    <a href={finalDocument.url} target="_blank" rel="noopener noreferrer">
                                      <Download className="h-5 w-5" />
                                    </a>
                                  </Button>
                                );
                              } else {
                                return <p className="text-sm text-yellow-600">Doc final non trouvé</p>;
                              }
                            })()
                          )}
                          {request.status !== 'valide' && (
                            <Link href={`/citizen/request/${request._id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-5 w-5" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Mises à jour de vos demandes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`mt-1 rounded-full p-1 ${
                        request.status === 'valide' 
                          ? 'bg-green-100 text-green-600' 
                          : request.status === 'rejete'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-amber-100 text-amber-600'
                      }`}>
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            {getDocumentTypeLabel(request.documentType)}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getStatusLabel(request.status)}
                        </p>
                        {request.status === 'valide' && request.files && request.files.length > 0 && (
                          (() => {
                            const finalDocument = request.files.find(file => file.type === 'acte_naissance_final');
                            if (finalDocument) {
                              return (
                                <Button variant="link" size="sm" className="p-0 h-auto mt-2" asChild>
                                  <Link href={finalDocument.url}>
                                    Télécharger le document
                                  </Link>
                                </Button>
                              );
                            } else {
                              return <p className="text-sm text-yellow-600">Doc final non trouvé</p>;
                            }
                          })()
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
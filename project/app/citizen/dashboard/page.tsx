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
  Search 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CitizenLayout } from "@/components/layouts/citizen-layout";
import { toast } from "sonner";

interface Stats {
  totalRequests: number;
  lastMonthRequests: number;
  pendingRequests: number;
  validatedRequests: number;
  rejectedRequests: number;
}

interface RecentRequest {
  id: string;
  type: string;
  date: string;
  status: string;
}

const notifications = [
  {
    id: 1,
    message: "Votre demande d'acte de naissance a été acceptée.",
    date: "Il y a 2 heures",
    read: false
  },
  {
    id: 2,
    message: "Le paiement pour votre demande a été confirmé.",
    date: "Il y a 1 jour",
    read: true
  },
  {
    id: 3,
    message: "Votre document est prêt à être téléchargé.",
    date: "Il y a 3 jours",
    read: true
  }
];

export default function CitizenDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    lastMonthRequests: 0,
    pendingRequests: 0,
    validatedRequests: 0,
    rejectedRequests: 0
  });
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [allRequests, setAllRequests] = useState<RecentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isLoadingAllRequests, setIsLoadingAllRequests] = useState(true);
  
  useEffect(() => {
    fetchStats();
    fetchRecentRequests();
    fetchAllRequests();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/citizen/stats');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la récupération des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentRequests = async () => {
    try {
      const response = await fetch('/api/citizen/recent-requests');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des demandes récentes');
      }
      const data = await response.json();
      setRecentRequests(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la récupération des demandes récentes');
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const fetchAllRequests = async () => {
    try {
      const response = await fetch('/api/citizen/all-requests');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'historique des demandes');
      }
      const data = await response.json();
      setAllRequests(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la récupération de l\'historique des demandes');
    } finally {
      setIsLoadingAllRequests(false);
    }
  };
  
  const filteredRequests = allRequests.filter(request => 
    request.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    request.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Vos dernières demandes</CardTitle>
                <CardDescription>
                  Suivez l'état de vos demandes récentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingRequests ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : recentRequests.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Aucune demande récente
                    </div>
                  ) : (
                    recentRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 animation-slideUp">
                        <div className="space-y-1">
                          <p className="font-medium">{request.type}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-muted-foreground">{request.id}</p>
                            <span className="text-sm text-muted-foreground">•</span>
                            <p className="text-sm text-muted-foreground">{request.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge 
                            variant={
                              request.status === "Validé" 
                                ? "success" 
                                : request.status === "Rejeté" 
                                  ? "destructive" 
                                  : "outline"
                            }
                            className={
                              request.status === "Validé" 
                                ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100" 
                                : request.status === "Rejeté" 
                                  ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100" 
                                  : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100"
                            }
                          >
                            {request.status}
                          </Badge>
                          <Link href={`/citizen/document/${request.id}`}>
                            <Button variant="ghost" size="icon">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Notifications récentes</CardTitle>
                <CardDescription>
                  Restez informé des mises à jour
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-4 border-b pb-4 last:border-0 last:pb-0 animation-fadeIn">
                      <div className={`mt-0.5 rounded-full p-1 ${notification.read ? 'opacity-30' : 'bg-primary/10 text-primary'}`}>
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className={`text-sm ${notification.read ? 'text-muted-foreground' : 'font-medium'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">{notification.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Toutes vos demandes</CardTitle>
                <CardDescription>
                  Historique complet de vos demandes
                </CardDescription>
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input 
                    type="search" 
                    placeholder="Rechercher une demande..." 
                    className="w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" size="icon" variant="ghost">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="w-full max-w-md grid grid-cols-4">
                    <TabsTrigger value="all">Tous</TabsTrigger>
                    <TabsTrigger value="pending">En attente</TabsTrigger>
                    <TabsTrigger value="approved">Validés</TabsTrigger>
                    <TabsTrigger value="rejected">Rejetés</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all">
                    <div className="rounded-md border">
                      <div className="grid grid-cols-4 p-4 font-medium">
                        <div>Référence</div>
                        <div>Type de document</div>
                        <div>Date</div>
                        <div>Statut</div>
                      </div>
                      <div className="divide-y">
                        {isLoadingAllRequests ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : filteredRequests.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Aucune demande trouvée
                          </div>
                        ) : (
                          filteredRequests.map((request) => (
                            <Link href={`/citizen/document/${request.id}`} key={request.id}>
                              <div className="grid grid-cols-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                                <div>{request.id}</div>
                                <div>{request.type}</div>
                                <div>{request.date}</div>
                                <div>
                                  <Badge 
                                    variant={
                                      request.status === "Validé" 
                                        ? "success" 
                                        : request.status === "Rejeté" 
                                          ? "destructive" 
                                          : "outline"
                                    }
                                    className={
                                      request.status === "Validé" 
                                        ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100" 
                                        : request.status === "Rejeté" 
                                          ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100" 
                                          : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100"
                                    }
                                  >
                                    {request.status}
                                  </Badge>
                                </div>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="pending">
                    <div className="rounded-md border">
                      <div className="grid grid-cols-4 p-4 font-medium">
                        <div>Référence</div>
                        <div>Type de document</div>
                        <div>Date</div>
                        <div>Statut</div>
                      </div>
                      <div className="divide-y">
                        {isLoadingAllRequests ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : filteredRequests.filter(req => req.status === "En traitement").length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Aucune demande en attente
                          </div>
                        ) : (
                          filteredRequests
                            .filter(req => req.status === "En traitement")
                            .map((request) => (
                              <Link href={`/citizen/document/${request.id}`} key={request.id}>
                                <div className="grid grid-cols-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                                  <div>{request.id}</div>
                                  <div>{request.type}</div>
                                  <div>{request.date}</div>
                                  <div>
                                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100">
                                      {request.status}
                                    </Badge>
                                  </div>
                                </div>
                              </Link>
                            ))
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="approved">
                    <div className="rounded-md border">
                      <div className="grid grid-cols-4 p-4 font-medium">
                        <div>Référence</div>
                        <div>Type de document</div>
                        <div>Date</div>
                        <div>Statut</div>
                      </div>
                      <div className="divide-y">
                        {isLoadingAllRequests ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : filteredRequests.filter(req => req.status === "Validé").length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Aucune demande validée
                          </div>
                        ) : (
                          filteredRequests
                            .filter(req => req.status === "Validé")
                            .map((request) => (
                              <Link href={`/citizen/document/${request.id}`} key={request.id}>
                                <div className="grid grid-cols-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                                  <div>{request.id}</div>
                                  <div>{request.type}</div>
                                  <div>{request.date}</div>
                                  <div>
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100">
                                      {request.status}
                                    </Badge>
                                  </div>
                                </div>
                              </Link>
                            ))
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="rejected">
                    <div className="rounded-md border">
                      <div className="grid grid-cols-4 p-4 font-medium">
                        <div>Référence</div>
                        <div>Type de document</div>
                        <div>Date</div>
                        <div>Statut</div>
                      </div>
                      <div className="divide-y">
                        {isLoadingAllRequests ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : filteredRequests.filter(req => req.status === "Rejeté").length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Aucune demande rejetée
                          </div>
                        ) : (
                          filteredRequests
                            .filter(req => req.status === "Rejeté")
                            .map((request) => (
                              <Link href={`/citizen/document/${request.id}`} key={request.id}>
                                <div className="grid grid-cols-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                                  <div>{request.id}</div>
                                  <div>{request.type}</div>
                                  <div>{request.date}</div>
                                  <div>
                                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100">
                                      {request.status}
                                    </Badge>
                                  </div>
                                </div>
                              </Link>
                            ))
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
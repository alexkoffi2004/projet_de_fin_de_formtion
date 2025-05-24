"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, FileText, User, LogOut } from "lucide-react";
import { toast } from "sonner";
import { logout } from "@/lib/auth";

interface AgentStats {
  documentsEnCours: number;
  documentsTraites: number;
  documentsEnAttente: number;
}

export default function AgentDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<AgentStats>({
    documentsEnCours: 0,
    documentsTraites: 0,
    documentsEnAttente: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/agent-login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role === "agent") {
      fetchAgentStats();
    }
  }, [session]);

  const fetchAgentStats = async () => {
    try {
      const response = await fetch('/api/agent/stats');
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

  const handleLogout = () => {
    logout();
    router.push('/auth/agent-login');
  };

  if (status === "loading") {
    return <div>Chargement...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Shield className="h-6 w-6 text-primary" />
            <span className="ml-2 font-bold">Espace Agent</span>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="container space-y-4 p-8 pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
            <h2 className="text-3xl font-bold tracking-tight">Tableau de Bord Agent</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Connecté en tant que {session?.user?.name}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents en cours</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : stats.documentsEnCours}</div>
                <p className="text-xs text-muted-foreground">
                  documents en traitement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents traités</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : stats.documentsTraites}</div>
                <p className="text-xs text-muted-foreground">
                  documents complétés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents en attente</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : stats.documentsEnAttente}</div>
                <p className="text-xs text-muted-foreground">
                  documents à traiter
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>
                  Accès rapide aux fonctionnalités principales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <Button className="w-full" variant="outline" onClick={() => router.push('/agent/documents')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Gérer les Documents
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => router.push('/agent/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Mon Profil
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Informations du compte</CardTitle>
                <CardDescription>
                  Détails de votre compte agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Nom</p>
                      <p className="text-sm text-muted-foreground">{session?.user?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Documents traités aujourd'hui</p>
                      <p className="text-sm text-muted-foreground">
                        {isLoading ? "..." : stats.documentsTraites}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 
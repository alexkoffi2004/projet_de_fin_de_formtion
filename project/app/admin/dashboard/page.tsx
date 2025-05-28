"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Users, 
  Bell, 
  Shield, 
  UserCog, 
  Settings, 
  LogOut,
  BarChart4,
  Clock,
  CheckCircle,
  BarChart3,
  UserPlus,
  UserMinus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserNav } from "@/components/user-nav";
import { Input } from "@/components/ui/input";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AgentStats {
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  newAgents: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [agentStats, setAgentStats] = useState<AgentStats>({
    totalAgents: 0,
    activeAgents: 0,
    inactiveAgents: 0,
    newAgents: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAgentStats();
  }, []);

  const fetchAgentStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }
      const data = await response.json();
      setAgentStats(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la récupération des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold">Console d'Administration</span>
            </Link>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">2</span>
            </div>
            <UserNav />
          </div>
        </div>
      </header>
      <div className="flex-1">
        <div className="border-b">
          <div className="container flex h-16 items-center gap-4 px-4 sm:gap-8">
            <Link href="/admin/dashboard" className="font-medium text-primary">
              Tableau de bord
            </Link>
            <Link href="/admin/dashboard/users" className="text-muted-foreground transition-colors hover:text-foreground">
              Gestion des Utilisateurs
            </Link>
            <Link href="/admin/dashboard/documents" className="text-muted-foreground transition-colors hover:text-foreground">
              Gestion des Documents
            </Link>
            <Link href="/admin/dashboard/agents" className="text-muted-foreground transition-colors hover:text-foreground">
              Gestion des Agents
            </Link>
            <Link href="/admin/dashboard/document-types" className="text-muted-foreground transition-colors hover:text-foreground">
              Types de Documents
            </Link>
            <Link href="/admin/dashboard/statistics" className="text-muted-foreground transition-colors hover:text-foreground">
              Statistiques
            </Link>
            <Link href="/admin/settings" className="text-muted-foreground transition-colors hover:text-foreground">
              Paramètres
            </Link>
          </div>
        </div>
        <div className="container space-y-4 p-8 pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
            <h2 className="text-3xl font-bold tracking-tight">Console d'Administration</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agents Actifs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : agentStats.activeAgents}</div>
                <p className="text-xs text-muted-foreground">
                  sur {isLoading ? "..." : agentStats.totalAgents} agents au total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nouveaux Agents</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : agentStats.newAgents}</div>
                <p className="text-xs text-muted-foreground">
                  dans les 30 derniers jours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agents Inactifs</CardTitle>
                <UserMinus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : agentStats.inactiveAgents}</div>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "..." : `${((agentStats.inactiveAgents / agentStats.totalAgents) * 100).toFixed(1)}% du total`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux d'Activité</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : `${((agentStats.activeAgents / agentStats.totalAgents) * 100).toFixed(1)}%`}
                </div>
                <p className="text-xs text-muted-foreground">
                  des agents sont actifs
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Vue d'ensemble du système</CardTitle>
                <CardDescription>
                  Statistiques d'utilisation du portail administratif
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded-md p-4">
                  <div className="text-center space-y-2">
                    <BarChart4 className="h-16 w-16 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Graphique d'activité (simulé)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>
                  Accès rapide aux fonctionnalités principales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <Button className="w-full" variant="outline" onClick={() => router.push('/admin/dashboard/users')}>
                    <UserCog className="mr-2 h-4 w-4" />
                    Gérer les Utilisateurs
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => router.push('/admin/dashboard/documents')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Gérer les Documents
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => router.push('/admin/dashboard/agents')}>
                    <Users className="mr-2 h-4 w-4" />
                    Gérer les Agents
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => router.push('/admin/dashboard/statistics')}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Voir les Statistiques
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 
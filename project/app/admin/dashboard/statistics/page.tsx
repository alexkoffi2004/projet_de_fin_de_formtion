"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, UserMinus, CheckCircle, BarChart4 } from "lucide-react";
import { toast } from "sonner";

interface AgentStats {
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  newAgents: number;
}

export default function StatisticsPage() {
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

  return (
    <div className="container space-y-4 p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Statistiques Détaillées</h2>
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
            <CardTitle>Distribution des Agents</CardTitle>
            <CardDescription>
              Répartition des agents par statut
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border rounded-md p-4">
              <div className="text-center space-y-2">
                <BarChart4 className="h-16 w-16 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Graphique de distribution (simulé)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Détails des Statistiques</CardTitle>
            <CardDescription>
              Informations complémentaires sur les agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total des agents</span>
                <span className="font-medium">{isLoading ? "..." : agentStats.totalAgents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Agents actifs</span>
                <span className="font-medium">{isLoading ? "..." : agentStats.activeAgents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Agents inactifs</span>
                <span className="font-medium">{isLoading ? "..." : agentStats.inactiveAgents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Nouveaux agents (30j)</span>
                <span className="font-medium">{isLoading ? "..." : agentStats.newAgents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Taux d'activité</span>
                <span className="font-medium">
                  {isLoading ? "..." : `${((agentStats.activeAgents / agentStats.totalAgents) * 100).toFixed(1)}%`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Agent {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export default function AdminAgents() {
  const { data: session } = useSession();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    email: '',
    name: '',
    password: ''
  });

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/admin/agents');
        const data = await response.json();
        if (data.status === 'success') {
          setAgents(data.data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des agents:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchAgents();
    }
  }, [session]);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAgent),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setAgents([...agents, data.data]);
        setIsDialogOpen(false);
        setNewAgent({ email: '', name: '', password: '' });
        alert('Agent créé avec succès. Identifiants : ' + JSON.stringify(data.credentials));
      } else {
        alert('Erreur lors de la création de l\'agent');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Agents</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouvel agent</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={newAgent.password}
                  onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  Créer l'agent
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {agents.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">Aucun agent trouvé</p>
            </CardContent>
          </Card>
        ) : (
          agents.map((agent) => (
            <Card key={agent._id}>
              <CardHeader>
                <CardTitle>{agent.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{agent.email}</p>
                <p className="text-sm text-gray-500">
                  Créé le {new Date(agent.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 
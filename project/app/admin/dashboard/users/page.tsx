"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Citizen {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function UsersManagementPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCitizen, setNewCitizen] = useState({
    email: "",
    name: "",
    password: "",
  });

  useEffect(() => {
    fetchCitizens();
  }, []);

  const fetchCitizens = async () => {
    try {
      const response = await fetch("/api/admin/citizens");
      if (!response.ok) throw new Error("Erreur lors de la récupération des citoyens");
      const data = await response.json();
      setCitizens(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les citoyens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCitizen = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/citizens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCitizen),
      });

      if (!response.ok) throw new Error("Erreur lors de la création du citoyen");

      toast({
        title: "Succès",
        description: "Citoyen créé avec succès",
      });

      setIsDialogOpen(false);
      setNewCitizen({
        email: "",
        name: "",
        password: "",
      });
      fetchCitizens();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le citoyen",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (citizenId: string, currentStatus: string) => {
    try {
      const response = await fetch(`/api/admin/citizens/${citizenId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: currentStatus === "active" ? "inactive" : "active",
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la modification du statut");

      toast({
        title: "Succès",
        description: "Statut modifié avec succès",
      });

      fetchCitizens();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div className="flex-1 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestion des Citoyens</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Nouveau Citoyen</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau citoyen</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCitizen} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={newCitizen.name}
                    onChange={(e) => setNewCitizen({ ...newCitizen, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCitizen.email}
                    onChange={(e) => setNewCitizen({ ...newCitizen, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newCitizen.password}
                    onChange={(e) => setNewCitizen({ ...newCitizen, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Créer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {citizens.map((citizen) => (
            <TableRow key={citizen.id}>
              <TableCell>{citizen.name}</TableCell>
              <TableCell>{citizen.email}</TableCell>
              <TableCell>{citizen.status}</TableCell>
              <TableCell>{new Date(citizen.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button
                  variant={citizen.status === "active" ? "destructive" : "default"}
                  onClick={() => handleToggleStatus(citizen.id, citizen.status)}
                >
                  {citizen.status === "active" ? "Désactiver" : "Activer"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 
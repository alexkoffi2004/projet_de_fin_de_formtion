"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight,
  Search,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentLayout } from "@/components/layouts/agent-layout";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Document {
  id: string;
  type: string;
  date: string;
  status: string;
  citizen: {
    name: string;
    email: string;
  };
}

export default function AgentDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/agent/documents');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des demandes');
      }
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la récupération des demandes');
    } finally {
      setIsLoading(false);
    }
  };

  const updateDocumentStatus = async (documentId: string, status: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/agent/documents', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId, status }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      toast.success('Statut mis à jour avec succès');
      fetchDocuments(); // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setIsUpdating(false);
      setSelectedDocument(null);
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.citizen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.citizen.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AgentLayout>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Gestion des demandes</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Toutes les demandes</CardTitle>
              <CardDescription>
                Gérez les demandes des citoyens
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
                  <TabsTrigger value="all">Toutes</TabsTrigger>
                  <TabsTrigger value="pending">En attente</TabsTrigger>
                  <TabsTrigger value="approved">Validées</TabsTrigger>
                  <TabsTrigger value="rejected">Rejetées</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-6 p-4 font-medium">
                      <div>Référence</div>
                      <div>Type</div>
                      <div>Citoyen</div>
                      <div>Email</div>
                      <div>Date</div>
                      <div>Statut</div>
                    </div>
                    <div className="divide-y">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : filteredDocuments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Aucune demande trouvée
                        </div>
                      ) : (
                        filteredDocuments.map((doc) => (
                          <div key={doc.id} className="grid grid-cols-6 p-4 hover:bg-muted/50">
                            <div>{doc.id}</div>
                            <div>{doc.type}</div>
                            <div>{doc.citizen.name}</div>
                            <div>{doc.citizen.email}</div>
                            <div>{doc.date}</div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={
                                  doc.status === "Validé" 
                                    ? "success" 
                                    : doc.status === "Rejeté" 
                                      ? "destructive" 
                                      : "outline"
                                }
                                className={
                                  doc.status === "Validé" 
                                    ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100" 
                                    : doc.status === "Rejeté" 
                                      ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100" 
                                      : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100"
                                }
                              >
                                {doc.status}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setSelectedDocument(doc)}>
                                    Changer le statut
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="pending">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-6 p-4 font-medium">
                      <div>Référence</div>
                      <div>Type</div>
                      <div>Citoyen</div>
                      <div>Email</div>
                      <div>Date</div>
                      <div>Statut</div>
                    </div>
                    <div className="divide-y">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : filteredDocuments.filter(doc => doc.status === "En traitement").length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Aucune demande en attente
                        </div>
                      ) : (
                        filteredDocuments
                          .filter(doc => doc.status === "En traitement")
                          .map((doc) => (
                            <div key={doc.id} className="grid grid-cols-6 p-4 hover:bg-muted/50">
                              <div>{doc.id}</div>
                              <div>{doc.type}</div>
                              <div>{doc.citizen.name}</div>
                              <div>{doc.citizen.email}</div>
                              <div>{doc.date}</div>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100">
                                  {doc.status}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSelectedDocument(doc)}>
                                      Changer le statut
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="approved">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-6 p-4 font-medium">
                      <div>Référence</div>
                      <div>Type</div>
                      <div>Citoyen</div>
                      <div>Email</div>
                      <div>Date</div>
                      <div>Statut</div>
                    </div>
                    <div className="divide-y">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : filteredDocuments.filter(doc => doc.status === "Validé").length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Aucune demande validée
                        </div>
                      ) : (
                        filteredDocuments
                          .filter(doc => doc.status === "Validé")
                          .map((doc) => (
                            <div key={doc.id} className="grid grid-cols-6 p-4 hover:bg-muted/50">
                              <div>{doc.id}</div>
                              <div>{doc.type}</div>
                              <div>{doc.citizen.name}</div>
                              <div>{doc.citizen.email}</div>
                              <div>{doc.date}</div>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100">
                                  {doc.status}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSelectedDocument(doc)}>
                                      Changer le statut
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="rejected">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-6 p-4 font-medium">
                      <div>Référence</div>
                      <div>Type</div>
                      <div>Citoyen</div>
                      <div>Email</div>
                      <div>Date</div>
                      <div>Statut</div>
                    </div>
                    <div className="divide-y">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : filteredDocuments.filter(doc => doc.status === "Rejeté").length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Aucune demande rejetée
                        </div>
                      ) : (
                        filteredDocuments
                          .filter(doc => doc.status === "Rejeté")
                          .map((doc) => (
                            <div key={doc.id} className="grid grid-cols-6 p-4 hover:bg-muted/50">
                              <div>{doc.id}</div>
                              <div>{doc.type}</div>
                              <div>{doc.citizen.name}</div>
                              <div>{doc.citizen.email}</div>
                              <div>{doc.date}</div>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100">
                                  {doc.status}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSelectedDocument(doc)}>
                                      Changer le statut
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
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

      <AlertDialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Changer le statut de la demande</AlertDialogTitle>
            <AlertDialogDescription>
              Sélectionnez le nouveau statut pour la demande {selectedDocument?.id}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => updateDocumentStatus(selectedDocument!.id, 'en_attente')}
              disabled={isUpdating}
            >
              <Clock className="h-4 w-4" />
              <span>En attente</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => updateDocumentStatus(selectedDocument!.id, 'valide')}
              disabled={isUpdating}
            >
              <CheckCircle className="h-4 w-4" />
              <span>Valider</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => updateDocumentStatus(selectedDocument!.id, 'rejete')}
              disabled={isUpdating}
            >
              <AlertCircle className="h-4 w-4" />
              <span>Rejeter</span>
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Annuler</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AgentLayout>
  );
} 
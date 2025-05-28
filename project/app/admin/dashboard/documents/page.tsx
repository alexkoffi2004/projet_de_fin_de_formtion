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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface Document {
  id: string;
  type: "BirthDeclaration" | "BirthCertificate";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  citizenId: string;
  citizenName: string;
}

export default function DocumentsManagementPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/admin/documents");
      if (!response.ok) throw new Error("Erreur lors de la récupération des documents");
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (documentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/documents/${documentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Erreur lors de la modification du statut");

      toast({
        title: "Succès",
        description: "Statut modifié avec succès",
      });

      fetchDocuments();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Documents</h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Citoyen</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead>Dernière modification</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell>
                {document.type === "BirthDeclaration" ? "Déclaration de naissance" : "Acte de naissance"}
              </TableCell>
              <TableCell>{document.citizenName}</TableCell>
              <TableCell>
                <Select
                  value={document.status}
                  onValueChange={(value) => handleStatusChange(document.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="approuvé">Approuvé</SelectItem>
                    <SelectItem value="rejeté">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{new Date(document.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(document.updatedAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  onClick={() => handleViewDocument(document)}
                >
                  Voir détails
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du document</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div>
                <Label>Type de document</Label>
                <p>
                  {selectedDocument.type === "BirthDeclaration"
                    ? "Déclaration de naissance"
                    : "Acte de naissance"}
                </p>
              </div>
              <div>
                <Label>Citoyen</Label>
                <p>{selectedDocument.citizenName}</p>
              </div>
              <div>
                <Label>Statut</Label>
                <p>{selectedDocument.status}</p>
              </div>
              <div>
                <Label>Date de création</Label>
                <p>{new Date(selectedDocument.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <Label>Dernière modification</Label>
                <p>{new Date(selectedDocument.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 
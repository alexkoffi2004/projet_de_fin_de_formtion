'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DocumentType {
  id: string;
  name: string;
  description: string;
  requiredFields: string[];
  validityPeriod: number; // en jours
}

export default function DocumentTypesManagement() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([
    {
      id: '1',
      name: 'Carte d\'identité',
      description: 'Document d\'identification officiel',
      requiredFields: ['nom', 'prénom', 'date de naissance', 'photo'],
      validityPeriod: 3650
    },
    {
      id: '2',
      name: 'Permis de conduire',
      description: 'Autorisation de conduire un véhicule',
      requiredFields: ['nom', 'prénom', 'date de naissance', 'photo', 'catégorie'],
      validityPeriod: 3650
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocumentTypes = documentTypes.filter(docType =>
    docType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    docType.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Types de Documents</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Ajouter un Type de Document</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau type de document</DialogTitle>
            </DialogHeader>
            {/* Formulaire d'ajout de type de document à implémenter */}
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Rechercher un type de document..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Champs Requis</TableHead>
            <TableHead>Validité (jours)</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDocumentTypes.map((docType) => (
            <TableRow key={docType.id}>
              <TableCell>{docType.name}</TableCell>
              <TableCell>{docType.description}</TableCell>
              <TableCell>
                <ul className="list-disc list-inside">
                  {docType.requiredFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
              </TableCell>
              <TableCell>{docType.validityPeriod}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" className="mr-2">
                  Modifier
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600">
                  Supprimer
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 
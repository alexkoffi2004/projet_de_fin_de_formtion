"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, 
  Search,
  Download,
  Eye,
  Filter,
  ChevronDown,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CitizenLayout } from "@/components/layouts/citizen-layout";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Document {
  _id: string;
  documentType: string;
  status: string;
  createdAt: string;
  documentUrl?: string;
  reason?: string;
  additionalInfo?: string;
  urgency?: string;
}

export default function CitizenDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/citizen/documents');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des documents');
      }
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la récupération des documents');
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

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      getDocumentTypeLabel(doc.documentType).toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.reason && doc.reason.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesType = typeFilter === 'all' || doc.documentType === typeFilter;

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const docDate = new Date(doc.createdAt);
      const now = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      switch (dateFilter) {
        case 'week':
          matchesDate = docDate >= lastWeek;
          break;
        case 'month':
          matchesDate = docDate >= lastMonth;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  return (
    <CitizenLayout>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Mes documents</h2>
              <p className="text-muted-foreground">
                Gérez et suivez vos demandes de documents
              </p>
            </div>
            <Link href="/citizen/document/new">
              <Button>Nouvelle demande</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex-1 w-full md:w-auto">
                  <Input
                    placeholder="Rechercher une demande..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="w-full md:w-[300px]"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="en_attente">En attente</SelectItem>
                      <SelectItem value="valide">Validé</SelectItem>
                      <SelectItem value="rejete">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Type de document" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="birth_certificate">Acte de naissance</SelectItem>
                      <SelectItem value="residence_certificate">Certificat de résidence</SelectItem>
                      <SelectItem value="marriage_certificate">Certificat de mariage</SelectItem>
                      <SelectItem value="criminal_record">Extrait de casier judiciaire</SelectItem>
                      <SelectItem value="id_card">Carte d'identité</SelectItem>
                      <SelectItem value="passport">Passeport</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les périodes</SelectItem>
                      <SelectItem value="week">Dernière semaine</SelectItem>
                      <SelectItem value="month">Dernier mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-6 p-4 font-medium bg-muted/50">
                  <div className="col-span-2">Type de document</div>
                  <div>Date</div>
                  <div>Statut</div>
                  <div>Urgence</div>
                  <div className="text-right">Actions</div>
                </div>
                <div className="divide-y">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : filteredDocuments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune demande trouvée
                    </div>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <div
                        key={doc._id}
                        className="grid grid-cols-6 p-4 items-center hover:bg-muted/50 transition-colors"
                      >
                        <div className="col-span-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {getDocumentTypeLabel(doc.documentType)}
                              </p>
                              {doc.reason && (
                                <p className="text-sm text-muted-foreground">
                                  {doc.reason}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                          {getStatusBadge(doc.status)}
                        </div>
                        <div>
                          <Badge variant="outline">
                            {doc.urgency === 'urgent' ? 'Urgent' : 'Normal'}
                          </Badge>
                        </div>
                        <div className="flex justify-end space-x-2">
                          {doc.status === 'valide' && doc.documentUrl && (
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={doc.documentUrl}>
                                <Download className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/citizen/document/${doc._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CitizenLayout>
  );
} 
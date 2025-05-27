"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Search,
  Eye,
  Filter,
  ChevronDown,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AgentLayout } from "@/components/layouts/agent-layout";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface Request {
  id: string;
  type: 'birth_certificate' | 'birth_declaration';
  fullName?: string;
  childFirstName?: string;
  childLastName?: string;
  birthDate: Date;
  birthPlace: string;
  status: string;
  trackingNumber?: string;
  createdAt: Date;
  citizen: {
    name: string;
    email: string;
  };
}

export default function AllRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/agent/requests');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des demandes');
      }
      const data = await response.json();
      setRequests(data.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la récupération des demandes');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'en_attente':
        return <Badge variant="secondary">En attente</Badge>;
      case 'APPROVED':
      case 'approuvé':
        return <Badge variant="success">Validé</Badge>;
      case 'REJECTED':
      case 'rejeté':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'birth_certificate':
        return "Acte de naissance";
      case 'birth_declaration':
        return "Déclaration de naissance";
      default:
        return type;
    }
  };

  const getFullName = (request: Request) => {
    if (request.type === 'birth_certificate') {
      return request.fullName || 'N/A';
    } else {
      return `${request.childFirstName || ''} ${request.childLastName || ''}`.trim() || 'N/A';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      getFullName(request).toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.citizen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.citizen.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <AgentLayout>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Toutes les demandes</h2>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex-1 w-full md:w-auto">
                  <Input
                    placeholder="Rechercher une demande..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                      <SelectItem value="PENDING">En attente</SelectItem>
                      <SelectItem value="APPROVED">Validé</SelectItem>
                      <SelectItem value="REJECTED">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Type de document" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="birth_certificate">Acte de naissance</SelectItem>
                      <SelectItem value="birth_declaration">Déclaration de naissance</SelectItem>
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
                  <div>Demandeur</div>
                  <div className="text-right">Actions</div>
                </div>
                <div className="divide-y">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune demande trouvée
                    </div>
                  ) : (
                    filteredRequests.map((request) => (
                      <div
                        key={request.id}
                        className="grid grid-cols-6 p-4 items-center hover:bg-muted/50 transition-colors"
                      >
                        <div className="col-span-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {getDocumentTypeLabel(request.type)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {getFullName(request)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                          {getStatusBadge(request.status)}
                        </div>
                        <div>
                          <p className="font-medium">{request.citizen.name}</p>
                          <p className="text-sm text-muted-foreground">{request.citizen.email}</p>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (request.type === 'birth_certificate') {
                                router.push(`/agent/documents/${request.id}`);
                              } else {
                                router.push(`/agent/birth-declarations/${request.id}`);
                              }
                            }}
                          >
                            <Eye className="h-4 w-4" />
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
    </AgentLayout>
  );
} 
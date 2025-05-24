'use client';

import { useEffect, useState } from 'react';
import { Request, RequestStatus, RequestType } from '@/types/request';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

const statusColors = {
  [RequestStatus.PENDING]: 'bg-yellow-500',
  [RequestStatus.IN_PROGRESS]: 'bg-blue-500',
  [RequestStatus.COMPLETED]: 'bg-green-500',
  [RequestStatus.REJECTED]: 'bg-red-500',
};

export default function MyRequests() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/requests');
        const data = await response.json();
        if (data.status === 'success') {
          setRequests(data.data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchRequests();
    }
  }, [session]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes Demandes</h1>
        <Link href="/citizen/new-request">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Demande
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">Vous n'avez pas encore de demandes</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{request.type}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={statusColors[request.status]}>
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{request.description}</p>
                {request.documents && request.documents.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Documents joints :</h4>
                    <ul className="list-disc list-inside">
                      {request.documents.map((doc, index) => (
                        <li key={index} className="text-sm text-gray-600">{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 
"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CitizenLayout } from "@/components/layouts/citizen-layout";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
  referenceId?: string;
}

export default function CitizenNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/citizen/notifications');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des notifications');
      }
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la récupération des notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/citizen/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la notification');
      }

      // Mettre à jour l'état local
      setNotifications(notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, status: 'READ' }
          : notification
      ));

      toast.success('Notification marquée comme lue');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour de la notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "BIRTH_CERTIFICATE":
        return <Bell className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    return status === "UNREAD"
      ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100"
      : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100";
  };

  return (
    <CitizenLayout>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vos notifications</CardTitle>
              <CardDescription>
                Restez informé des mises à jour de vos demandes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune notification
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-4 p-4 rounded-lg border ${
                        notification.status === "UNREAD" ? "bg-muted/50" : ""
                      }`}
                    >
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{notification.title}</p>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeClass(notification.status)}
                          >
                            {notification.status === "UNREAD" ? "Non lue" : "Lue"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {notification.status === "UNREAD" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Marquer comme lue
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CitizenLayout>
  );
} 
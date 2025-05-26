"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Bell, User, Settings, FileSpreadsheet, HelpCircle, LogOut } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface CitizenLayoutProps {
  children: React.ReactNode;
}

interface Notification {
  id: string;
  status: string;
}

export function CitizenLayout({ children }: CitizenLayoutProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  
  const routes = [
    {
      href: "/citizen/dashboard",
      label: "Tableau de bord",
      icon: LayoutDashboard,
      active: pathname === "/citizen/dashboard",
    },
    {
      href: "/citizen/document/new",
      label: "Nouvelle demande",
      icon: FileText,
      active: pathname === "/citizen/document/new",
    },
    {
      href: "/citizen/documents",
      label: "Mes documents",
      icon: FileSpreadsheet,
      active: pathname === "/citizen/documents",
    },
    {
      href: "/citizen/notifications",
      label: "Notifications",
      icon: Bell,
      active: pathname === "/citizen/notifications",
    },
    {
      href: "/citizen/profile",
      label: "Mon profil",
      icon: User,
      active: pathname === "/citizen/profile",
    },
    {
      href: "/citizen/settings",
      label: "Paramètres",
      icon: Settings,
      active: pathname === "/citizen/settings",
    },
    {
      href: "/citizen/help",
      label: "Aide & Support",
      icon: HelpCircle,
      active: pathname === "/citizen/help",
    },
  ];

  useEffect(() => {
    fetchUnreadCount();
    // Mettre à jour le compteur toutes les 30 secondes
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/citizen/notifications');
      if (!response.ok) return;
      
      const notifications: Notification[] = await response.json();
      const unread = notifications.filter(n => n.status === "UNREAD").length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">DocService</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/citizen/notifications">
              <Button variant="outline" size="icon" className="relative rounded-full">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center p-0"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
          <nav className="grid gap-2 p-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                  route.active
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <route.icon className="h-5 w-5" />
                <span>{route.label}</span>
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground mt-auto"
            >
              <LogOut className="h-5 w-5" />
              <span>Déconnexion</span>
            </Link>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
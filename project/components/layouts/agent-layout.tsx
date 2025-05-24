"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Home, 
  Settings, 
  Users,
  ClipboardList
} from "lucide-react";

interface AgentLayoutProps {
  children: ReactNode;
}

export function AgentLayout({ children }: AgentLayoutProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Tableau de bord",
      href: "/agent/dashboard",
      icon: Home
    },
    {
      name: "Demandes",
      href: "/agent/documents",
      icon: ClipboardList
    },
    {
      name: "Citoyens",
      href: "/agent/citizens",
      icon: Users
    },
    {
      name: "Documents",
      href: "/agent/document-types",
      icon: FileText
    },
    {
      name: "Paramètres",
      href: "/agent/settings",
      icon: Settings
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/agent/dashboard" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">Administration</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 transition-colors hover:text-foreground/80 ${
                      isActive ? "text-foreground" : "text-foreground/60"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
} 
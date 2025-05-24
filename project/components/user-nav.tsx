"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export function UserNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  
  // Determine what type of user we are based on the path
  const isAdmin = pathname?.includes("/admin");
  const isAgent = pathname?.includes("/agent");
  const isCitizen = pathname?.includes("/citizen") || (!isAdmin && !isAgent);
  
  const dashboardUrl = isAdmin 
    ? "/admin/dashboard" 
    : isAgent 
      ? "/agent/dashboard" 
      : "/citizen/dashboard";
  
  const profileUrl = isAdmin 
    ? "/admin/profile" 
    : isAgent 
      ? "/agent/profile" 
      : "/citizen/profile";
  
  const settingsUrl = isAdmin 
    ? "/admin/settings" 
    : isAgent 
      ? "/agent/settings" 
      : "/citizen/settings";
  
  const userType = isAdmin 
    ? "Administrateur" 
    : isAgent 
      ? "Agent" 
      : "Citoyen";
  
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/auth/login");
  };

  if (!session) {
    return null;
  }

  const userName = session.user?.name || "Utilisateur";
  const userEmail = session.user?.email || "";
  const userInitials = userName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt={userName} />
            <AvatarFallback className="bg-primary/10 text-primary">{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
            <p className="text-xs font-medium text-primary mt-1">
              {userType}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={dashboardUrl}>
            <DropdownMenuItem>
              Tableau de bord
            </DropdownMenuItem>
          </Link>
          <Link href={profileUrl}>
            <DropdownMenuItem>
              Profil
            </DropdownMenuItem>
          </Link>
          <Link href={settingsUrl}>
            <DropdownMenuItem>
              Paramètres
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-600 dark:text-red-400 cursor-pointer"
          onClick={handleSignOut}
        >
          Déconnexion
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
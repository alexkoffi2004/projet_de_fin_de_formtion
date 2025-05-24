"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MainNav() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const routes = [
    {
      href: "/",
      label: "Accueil",
    },
    {
      href: "#services",
      label: "Services",
    },
    {
      href: "#about",
      label: "À propos",
    },
    {
      href: "#contact",
      label: "Contact",
    },
  ];

  return (
    <div className="flex items-center">
      <div className="hidden md:flex gap-6">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary"
            )}
          >
            {route.label}
          </Link>
        ))}
      </div>
      <div className="md:hidden">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[350px]">
            <nav className="flex flex-col gap-4 mt-8">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="text-base py-2 transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {route.label}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t">
                <Link href="/auth/register" className="block mb-2">
                  <Button className="w-full">Inscription</Button>
                </Link>
                <Link href="/auth/login" className="block">
                  <Button variant="outline" className="w-full">Connexion</Button>
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
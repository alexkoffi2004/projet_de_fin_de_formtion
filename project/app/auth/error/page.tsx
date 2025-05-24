"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Utilisateur non trouvé":
        return "Aucun compte ne correspond à ces identifiants.";
      case "Mot de passe incorrect":
        return "Le mot de passe saisi est incorrect.";
      case "Informations de connexion manquantes":
        return "Veuillez remplir tous les champs requis.";
      case "Rôle invalide":
        return "Le rôle sélectionné n'est pas valide.";
      case "Votre compte est inactif. Veuillez contacter l'administrateur.":
        return "Votre compte est inactif. Veuillez contacter l'administrateur.";
      default:
        return "Une erreur est survenue lors de la connexion.";
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Link href="/auth/login" className="absolute top-8 left-8 flex items-center text-primary hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à la connexion
      </Link>

      <div className="w-full max-w-md space-y-8 animation-fadeIn">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-destructive">
            Erreur de connexion
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {getErrorMessage(error)}
          </p>
        </div>

        <div className="mt-8 bg-white p-8 rounded-lg shadow-sm border animation-slideUp">
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Veuillez vérifier vos identifiants et réessayer.
            </p>
            <Button
              asChild
              className="w-full"
            >
              <Link href="/auth/login">
                Retourner à la page de connexion
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
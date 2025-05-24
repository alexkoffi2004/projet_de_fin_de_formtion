"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { signIn } from "next-auth/react";

const formSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  password: z.string().min(1, {
    message: "Le mot de passe est requis.",
  }),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      console.log("Tentative de connexion avec:", { email: values.email });

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        role: "citizen",
        redirect: false,
      });

      console.log("Résultat de la connexion:", result);

      if (result?.error) {
        console.error("Erreur de connexion:", result.error);
        throw new Error(result.error);
      }

      if (result?.ok) {
        console.log("Connexion réussie, redirection vers le dashboard");
        router.push("/citizen/dashboard");
        router.refresh();
      } else {
        console.error("Connexion échouée sans erreur explicite");
        throw new Error("Échec de la connexion");
      }
    } catch (error) {
      console.error("Erreur complète:", error);
      toast({
        title: "Erreur de connexion",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Link href="/" className="absolute top-8 left-8 flex items-center text-primary hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à l'accueil
      </Link>
      
      <div className="w-full max-w-md space-y-8 animation-fadeIn">
        <div className="text-center">
          <div className="flex justify-center">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Connexion Citoyen
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              Inscrivez-vous ici
            </Link>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Vous êtes un agent ou un administrateur ?{" "}
            <Link href="/auth/agent-login" className="text-primary hover:underline">
              Connexion Agent
            </Link>
            {" | "}
            <Link href="/auth/admin-login" className="text-primary hover:underline">
              Connexion Admin
            </Link>
          </p>
        </div>
        
        <div className="mt-8 bg-white p-8 rounded-lg shadow-sm border animation-slideUp">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="nom@exemple.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input placeholder="********" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end">
                <Link href="#" className="text-sm text-primary hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
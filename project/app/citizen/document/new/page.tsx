"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  FileText, 
  Upload, 
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Baby
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CitizenLayout } from "@/components/layouts/citizen-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import BirthDeclaration from "@/components/services/BirthDeclaration";
import ActeNaissanceForm from "@/components/services/ActeNaissanceForm";

// Schéma de validation avec Zod
const formSchema = z.object({
  documentType: z.string({
    required_error: "Veuillez sélectionner un type de document",
  }),
  reason: z.string().min(10, {
    message: "La raison doit contenir au moins 10 caractères",
  }),
  additionalInfo: z.string().optional(),
  urgency: z.string({
    required_error: "Veuillez sélectionner un niveau d'urgence",
  }),
  documents: z.array(z.instanceof(File)).min(1, {
    message: "Veuillez joindre au moins un document",
  }),
});

// Types de documents disponibles
const documentTypes = [
  { 
    id: "birth_declaration", 
    label: "Déclaration de naissance", 
    description: "Déclarer la naissance d'un nouveau-né",
    icon: Baby,
    component: BirthDeclaration
  },
  { 
    id: "birth_certificate", 
    label: "Acte de naissance", 
    description: "Obtenir une copie d'acte de naissance",
    icon: FileText,
    component: ActeNaissanceForm
  },
  { 
    id: "residence_certificate", 
    label: "Certificat de résidence", 
    description: "Obtenir un certificat de résidence",
    icon: FileText
  },
  { 
    id: "marriage_certificate", 
    label: "Certificat de mariage", 
    description: "Obtenir un certificat de mariage",
    icon: FileText
  },
  { 
    id: "criminal_record", 
    label: "Extrait de casier judiciaire", 
    description: "Obtenir un extrait de casier judiciaire",
    icon: FileText
  },
  { 
    id: "id_card", 
    label: "Carte d'identité", 
    description: "Demander une carte d'identité",
    icon: FileText
  },
  { 
    id: "passport", 
    label: "Passeport", 
    description: "Demander un passeport",
    icon: FileText
  }
];

// Niveaux d'urgence
const urgencyLevels = [
  { id: "normal", label: "Normal" },
  { id: "urgent", label: "Urgent" },
  { id: "very_urgent", label: "Très urgent" },
];

export default function NewDocumentRequest() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: "",
      reason: "",
      additionalInfo: "",
      urgency: "normal",
      documents: [],
    },
  });

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  const selectedDocument = documentTypes.find(doc => doc.id === selectedType);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      form.setValue("documents", [...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    form.setValue("documents", newFiles);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Créer d'abord la demande de document
      const response = await fetch('/api/citizen/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: values.documentType,
          reason: values.reason,
          additionalInfo: values.additionalInfo,
          urgency: values.urgency,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la demande');
      }

      const { requestId } = await response.json();

      // Télécharger les fichiers
      const uploadPromises = values.documents.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentId', requestId);

        const uploadResponse = await fetch('/api/citizen/document/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Erreur lors du téléchargement de ${file.name}`);
        }
      });

      await Promise.all(uploadPromises);
      
      setShowSuccess(true);
      toast.success("Votre demande a été soumise avec succès");
      
      // Rediriger vers le dashboard après 3 secondes
      setTimeout(() => {
        router.push("/citizen/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Une erreur est survenue lors de la soumission de votre demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <CitizenLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <Alert className="w-full max-w-2xl bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Demande soumise avec succès</AlertTitle>
            <AlertDescription className="text-green-700">
              Votre demande a été enregistrée et sera traitée dans les plus brefs délais.
              Vous serez redirigé vers votre tableau de bord dans quelques instants.
            </AlertDescription>
          </Alert>
        </div>
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Nouvelle demande</h2>
          </div>

          {!selectedType ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documentTypes.map((type) => (
                <Card 
                  key={type.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleTypeSelect(type.id)}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <type.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{type.label}</CardTitle>
                        <CardDescription>{type.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedType(null)}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à la sélection
                </Button>
                <h3 className="text-xl font-semibold">
                  {selectedDocument?.label}
                </h3>
                <p className="text-muted-foreground">
                  {selectedDocument?.description}
                </p>
              </div>

              {selectedDocument?.component ? (
                <selectedDocument.component />
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>En cours de développement</AlertTitle>
                  <AlertDescription>
                    Ce type de demande sera bientôt disponible. Veuillez réessayer plus tard.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </div>
    </CitizenLayout>
  );
}
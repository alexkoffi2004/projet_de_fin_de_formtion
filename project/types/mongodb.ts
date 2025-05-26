import { ObjectId } from 'mongodb';

// Définition générique d'un document MongoDB avec un ObjectId
export interface MongoDBDocument {
  _id: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  // Ajoutez d'autres champs communs à tous les documents MongoDB ici si nécessaire
}

// Définition de l'interface pour les documents de la collection 'documents'
export interface Document extends MongoDBDocument {
  citizenEmail: string;
  documentType: string; // Ex: 'birth_certificate', 'birth_declaration', etc.
  status: string; // Ex: 'en_attente', 'valide', 'rejete'
  // Vous pouvez ajouter d'autres champs communs ici (ex: reason, urgency)
  // reason?: string;
  // urgency?: string;

  // Champ pour stocker les détails spécifiques à chaque type de document
  details?: any; // Ou une union de types spécifiques si vous avez des interfaces pour chaque type de document

  // Champ pour stocker les informations sur les fichiers joints
  files?: {
    name: string; // Nom original du fichier
    uniqueName?: string; // Nom unique si utilisé
    url: string; // URL du fichier sur Cloudinary
    publicId?: string; // ID public sur Cloudinary
    uploadedAt: Date;
  }[];

  // Champs spécifiques à certains types de documents peuvent être ajoutés ici ou dans 'details'
  // Pour l'acte de naissance, ces champs sont dans 'details', mais on pourrait les lister ici aussi si on voulait un accès direct typé
  // fullName?: string;
  // birthDate?: Date;
  // birthPlace?: string;
  // fatherFullName?: string;
  // motherFullName?: string;
  // acteNumber?: string;
  // demandeurIdProofUrl?: string;
  // existingActeUrl?: string;
}

// Vous pouvez définir des interfaces spécifiques pour les détails de chaque type de document si nécessaire
// export interface BirthCertificateDetails {
//   fullName: string;
//   birthDate: Date;
//   birthPlace: string;
//   fatherFullName?: string;
//   motherFullName?: string;
//   acteNumber?: string;
//   demandeurIdProofUrl: string;
//   existingActeUrl?: string;
// }

// Puis dans l'interface Document, utiliser:
// details?: BirthCertificateDetails | BirthDeclarationDetails | any; 
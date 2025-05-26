import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';
import { Document } from '@/types/mongodb';
import type { UploadApiOptions } from 'cloudinary';

// Configurer Cloudinary (utilisez vos propres variables d'environnement)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Utiliser HTTPS
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null; // Le nom 'file' doit correspondre au nom dans le formulaire Upload
    const documentId = formData.get('documentId') as string | null; // L'ID de la demande à associer

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier trouvé dans la requête' }, { status: 400 });
    }

     if (!documentId) {
        return NextResponse.json(
          { error: 'ID de la demande manquant pour l\'upload du fichier' },
          { status: 400 }
        );
     }

    const { db } = await connectToDatabase();
    
    // Vérifier que le document existe et appartient bien au citoyen
     let documentObjectId;
     try {
        documentObjectId = new ObjectId(documentId);
     } catch (e) {
         return NextResponse.json({ error: 'ID de document invalide' }, { status: 400 });
     }

    const document = await db.collection<Document>('documents').findOne({
      _id: documentObjectId,
      citizenEmail: session.user.email
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé ou accès refusé' },
        { status: 404 }
      );
    }

    // Lire le contenu du fichier et le convertir en Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convertir le buffer en string base64 pour l'upload vers Cloudinary
    const base64File = buffer.toString('base64');
    const dataUri = `data:${file.type};base66,${base64File}`;

    // Options d'upload pour Cloudinary
    const uploadOptions: UploadApiOptions = {
        folder: `citizen-documents/${documentId}`, // Organiser les uploads par ID de document
        resource_type: 'auto', // Utiliser le type littéral 'auto'
        public_id: `${documentId}_${Date.now()}_${file.name.replace(/\s+/g, '_')}`, // Nom public unique
        // Autres options si nécessaire (ex: tags, qualité, transformation)
    };

    // Upload du fichier vers Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(dataUri, uploadOptions);

    console.log('Cloudinary Upload Response:', cloudinaryResponse);

    if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
        console.error('Échec de l\'upload vers Cloudinary', cloudinaryResponse);
         return NextResponse.json(
           { error: 'Échec de l\'upload du fichier vers le service de stockage' },
           { status: 500 }
         );
    }

    const fileUrl = cloudinaryResponse.secure_url; // URL sécurisée du fichier sur Cloudinary
    const publicId = cloudinaryResponse.public_id; // ID public du fichier sur Cloudinary

    // Mettre à jour le document dans la base de données avec l'information du fichier Cloudinary
    try {

      const updateResult = await db.collection<Document>('documents').updateOne(
        { _id: documentObjectId },
        { 
          $push: { 
            files: {
              name: file.name,
              url: fileUrl,
              publicId: publicId,
              uploadedAt: new Date() 
            }
          }
        }
      );

      if (updateResult.matchedCount === 0) {
        console.warn(`Document avec ID ${documentId} non trouvé lors de la mise à jour après upload Cloudinary.`);
         // Le fichier est sur Cloudinary, mais la liaison DB a échoué. Peut nécessiter un nettoyage sur Cloudinary ou une gestion d'erreur.
      }

    } catch (dbError) {
      console.error('Erreur lors de la mise à jour du document en base de données après upload Cloudinary:', dbError);
       // Le fichier est sur Cloudinary, mais la mise à jour DB a échoué. Gérer cette erreur.
         return NextResponse.json(
           { error: 'Fichier uploadé mais erreur lors de la liaison à la demande en base de données' },
           { status: 500 }
         );
    }

    // Retourner une réponse de succès
    return NextResponse.json({
      message: 'Fichier téléchargé et lié avec succès',
      fileName: file.name,
      fileUrl: fileUrl, // Renvoyer l'URL Cloudinary
      publicId: publicId
    }, { status: 200 });

  } catch (error: any) { // Spécifier any ou unknown et vérifier le type
    console.error('Erreur générale lors du traitement de l\'upload Cloudinary:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du traitement de l\'upload du fichier', details: error.message },
      { status: 500 }
    );
  }
}

// OPTIONS method for CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
} 
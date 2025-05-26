import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';
import { Document } from '@/types/mongodb';
import type { UploadApiOptions, UploadApiResponse } from 'cloudinary';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
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
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier trouvé dans la requête' },
        { status: 400 }
      );
    }

    // Vérification de la taille du fichier (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB en bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux. Taille maximale: 2MB' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Lecture du fichier et conversion en Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Options d'upload pour Cloudinary
    const uploadOptions: UploadApiOptions = {
      folder: `citizen-documents/${session.user.email}`,
      resource_type: 'auto',
      public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      overwrite: false,
      invalidate: true
    };

    // Upload vers Cloudinary avec gestion d'erreur améliorée
    const cloudinaryResponse = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Erreur Cloudinary:', error);
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('Résultat Cloudinary indéfini'));
          }
        }
      ).end(buffer);
    });

    if (!cloudinaryResponse.secure_url) {
      throw new Error('Échec de l\'upload vers Cloudinary');
    }

    // Retourner la réponse avec les informations du fichier
    return NextResponse.json({
      success: true,
      message: 'Fichier téléchargé avec succès',
      data: {
        fileName: file.name,
        fileUrl: cloudinaryResponse.secure_url,
        publicId: cloudinaryResponse.public_id,
        fileType: file.type,
        size: file.size
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Erreur lors du traitement de l\'upload:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors du traitement de l\'upload du fichier',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// OPTIONS method for CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
} 
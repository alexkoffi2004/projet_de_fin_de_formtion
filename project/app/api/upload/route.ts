
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupération du fichier
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;

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

    // Conversion du fichier en Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload vers Cloudinary
    const cloudinaryResponse = await uploadToCloudinary(buffer, {
      folder: `documents/${session.user.email}`,
      public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
    });

    if (!cloudinaryResponse.secure_url) {
      throw new Error('Échec de l\'upload vers Cloudinary');
    }

    // Connexion à MongoDB
    const { db } = await connectToDatabase();

    // Enregistrement dans MongoDB
    const document = {
      citizenEmail: session.user.email,
      documentType,
      type: file.type,
      name: file.name,
      url: cloudinaryResponse.secure_url,
      publicId: cloudinaryResponse.public_id,
      size: file.size,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('documents').insertOne(document);

    // Retourner la réponse avec les informations du fichier
    return NextResponse.json({
      success: true,
      message: 'Fichier téléchargé avec succès',
      data: {
        id: result.insertedId,
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
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

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
    const file = formData.get('file') as File;
    const documentId = formData.get('documentId') as string;

    if (!file || !documentId) {
      return NextResponse.json(
        { error: 'Fichier ou ID de document manquant' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Vérifier que le document appartient bien au citoyen
    const document = await db.collection('documents').findOne({
      _id: documentId,
      citizenEmail: session.user.email
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      );
    }

    // Créer le dossier de stockage s'il n'existe pas
    const uploadDir = join(process.cwd(), 'uploads', documentId);
    await writeFile(join(uploadDir, file.name), Buffer.from(await file.arrayBuffer()));

    // Mettre à jour le document avec le chemin du fichier
    await db.collection('documents').updateOne(
      { _id: documentId },
      {
        $push: {
          documents: {
            name: file.name,
            path: join(uploadDir, file.name),
            uploadedAt: new Date()
          }
        }
      }
    );

    return NextResponse.json({
      message: 'Fichier téléchargé avec succès',
      fileName: file.name
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement du fichier' },
      { status: 500 }
    );
  }
} 
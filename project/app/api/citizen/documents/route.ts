import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    // Récupérer tous les documents du citoyen, triés par date de création (du plus récent au plus ancien)
    const documents = await db.collection('BirthCertificate')
      .find({ citizenId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des documents' },
      { status: 500 }
    );
  }
} 
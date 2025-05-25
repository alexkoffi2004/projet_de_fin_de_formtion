import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    // Récupérer tous les documents du citoyen, triés par date de création (du plus récent au plus ancien)
    const documents = await db.collection('documents')
      .find({ citizenEmail: session.user.email })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des documents' },
      { status: 500 }
    );
  }
} 
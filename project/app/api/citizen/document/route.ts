import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const citizen = await db.collection('citizens').findOne({ email: session.user.email });

    if (!citizen) {
      return NextResponse.json(
        { error: 'Citoyen non trouvé' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { documentType, reason, additionalInfo, urgency } = body;

    // Créer la demande de document
    const documentRequest = {
      citizenEmail: session.user.email,
      documentType,
      reason,
      additionalInfo,
      urgency,
      status: 'en_attente',
      createdAt: new Date(),
      updatedAt: new Date(),
      documents: [], // Les documents seront gérés séparément
    };

    const result = await db.collection('documents').insertOne(documentRequest);

    return NextResponse.json({
      message: 'Demande créée avec succès',
      requestId: result.insertedId
    });
  } catch (error) {
    console.error('Erreur lors de la création de la demande:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la demande' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query: any = { citizenEmail: session.user.email };
    if (status) {
      query.status = status;
    }

    const documents = await db.collection('documents')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des demandes' },
      { status: 500 }
    );
  }
} 
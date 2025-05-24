import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
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

    // Créer la nouvelle demande
    const newRequest = {
      citizenEmail: session.user.email,
      type: documentType,
      reason,
      additionalInfo,
      urgency,
      status: 'en_attente',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('documents').insertOne(newRequest);

    return NextResponse.json({
      status: 'success',
      message: 'Demande créée avec succès',
      data: {
        id: result.insertedId,
        ...newRequest
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la demande:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la demande' },
      { status: 500 }
    );
  }
} 
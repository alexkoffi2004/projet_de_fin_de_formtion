import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const agent = await db.collection('agents').findOne({ email: session.user.email });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent non trouvé' },
        { status: 404 }
      );
    }

    // Obtenir la date du début de la journée
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Compter les documents en cours
    const documentsEnCours = await db.collection('documents').countDocuments({
      agentEmail: session.user.email,
      status: 'en_cours'
    });

    // Compter les documents traités aujourd'hui
    const documentsTraites = await db.collection('documents').countDocuments({
      agentEmail: session.user.email,
      status: 'traite',
      updatedAt: { $gte: today }
    });

    // Compter les documents en attente
    const documentsEnAttente = await db.collection('documents').countDocuments({
      status: 'en_attente'
    });

    return NextResponse.json({
      documentsEnCours,
      documentsTraites,
      documentsEnAttente
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
} 
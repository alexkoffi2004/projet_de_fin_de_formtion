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

    // Obtenir la date du début du mois dernier
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setHours(0, 0, 0, 0);

    // Compter le nombre total de demandes
    const totalRequests = await db.collection('documents').countDocuments({
      citizenEmail: session.user.email
    });

    // Compter les demandes du mois dernier
    const lastMonthRequests = await db.collection('documents').countDocuments({
      citizenEmail: session.user.email,
      createdAt: { $gte: lastMonth }
    });

    // Compter les demandes en attente
    const pendingRequests = await db.collection('documents').countDocuments({
      citizenEmail: session.user.email,
      status: 'en_attente'
    });

    // Compter les demandes validées
    const validatedRequests = await db.collection('documents').countDocuments({
      citizenEmail: session.user.email,
      status: 'valide'
    });

    // Compter les demandes rejetées
    const rejectedRequests = await db.collection('documents').countDocuments({
      citizenEmail: session.user.email,
      status: 'rejete'
    });

    // Récupérer les demandes récentes (5 dernières)
    const recentRequests = await db.collection('documents')
      .find({ citizenEmail: session.user.email })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json({
      totalRequests,
      lastMonthRequests,
      pendingRequests,
      validatedRequests,
      rejectedRequests,
      recentRequests
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
} 
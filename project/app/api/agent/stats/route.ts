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

    // Vérifier si l'utilisateur est un agent
    const agent = await db.collection('agents').findOne({ email: session.user.email });
    if (!agent) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Obtenir la date du début du mois dernier
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setHours(0, 0, 0, 0);

    // Compter le nombre total de demandes
    const totalRequests = await db.collection('documents').countDocuments();

    // Compter les demandes du mois dernier
    const lastMonthRequests = await db.collection('documents').countDocuments({
      createdAt: { $gte: lastMonth }
    });

    // Compter les demandes en attente
    const pendingRequests = await db.collection('documents').countDocuments({
      status: 'en_attente'
    });

    // Compter les demandes validées
    const validatedRequests = await db.collection('documents').countDocuments({
      status: 'valide'
    });

    // Compter les demandes rejetées
    const rejectedRequests = await db.collection('documents').countDocuments({
      status: 'rejete'
    });

    // Récupérer les demandes récentes (5 dernières)
    const recentRequests = await db.collection('documents')
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Récupérer les statistiques par type de document
    const statsByType = await db.collection('documents').aggregate([
      {
        $group: {
          _id: '$documentType',
          count: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'en_attente'] }, 1, 0] }
          },
          validated: {
            $sum: { $cond: [{ $eq: ['$status', 'valide'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejete'] }, 1, 0] }
          }
        }
      }
    ]).toArray();

    // Récupérer les statistiques par jour (7 derniers jours)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const statsByDay = await db.collection('documents').aggregate([
      {
        $match: {
          createdAt: { $gte: lastWeek }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).toArray();

    return NextResponse.json({
      totalRequests,
      lastMonthRequests,
      pendingRequests,
      validatedRequests,
      rejectedRequests,
      recentRequests,
      statsByType,
      statsByDay
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
} 
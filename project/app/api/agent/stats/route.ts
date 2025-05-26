import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
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

    // Vérifier si l'utilisateur est un agent
    const agent = await prisma.agent.findUnique({
      where: { email: session.user.email }
    });

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
    const totalRequests = await prisma.birthCertificate.count();

    // Compter les demandes du mois dernier
    const lastMonthRequests = await prisma.birthCertificate.count({
      where: {
        createdAt: {
          gte: lastMonth
        }
      }
    });

    // Compter les demandes en attente
    const pendingRequests = await prisma.birthCertificate.count({
      where: {
        status: 'PENDING'
      }
    });

    // Compter les demandes validées
    const validatedRequests = await prisma.birthCertificate.count({
      where: {
        status: 'COMPLETED'
      }
    });

    // Compter les demandes rejetées
    const rejectedRequests = await prisma.birthCertificate.count({
      where: {
        status: 'REJECTED'
      }
    });

    // Récupérer les demandes récentes (5 dernières)
    const recentRequests = await prisma.birthCertificate.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        citizen: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Formater les demandes récentes
    const formattedRecentRequests = recentRequests.map(request => ({
      _id: request.id,
      documentType: 'birth_certificate',
      status: request.status,
      createdAt: request.createdAt.toISOString(),
      citizenEmail: request.citizen.email
    }));

    // Récupérer les statistiques par jour (7 derniers jours)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const statsByDay = await prisma.birthCertificate.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: lastWeek
        }
      },
      _count: true
    });

    // Formater les statistiques par jour
    const formattedStatsByDay = statsByDay.map(stat => ({
      _id: stat.createdAt.toISOString(),
      count: stat._count
    }));

    // Statistiques par type de document
    const statsByType = [
      {
        _id: 'birth_certificate',
        count: totalRequests,
        pending: pendingRequests,
        validated: validatedRequests,
        rejected: rejectedRequests
      }
    ];

    return NextResponse.json({
      totalRequests,
      lastMonthRequests,
      pendingRequests,
      validatedRequests,
      rejectedRequests,
      recentRequests: formattedRecentRequests,
      statsByDay: formattedStatsByDay,
      statsByType
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
} 
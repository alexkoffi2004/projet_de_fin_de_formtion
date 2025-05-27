import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Obtenir la date du début du mois dernier
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setHours(0, 0, 0, 0);

    // Récupérer toutes les demandes du citoyen
    const [birthCertificates, birthDeclarations] = await Promise.all([
      prisma.birthCertificate.findMany({
        where: {
          citizenId: session.user.id
        }
      }),
      prisma.birthDeclaration.findMany({
        where: {
          citizenId: session.user.id
        }
      })
    ]);

    // Combiner les demandes
    const allRequests = [
      ...birthCertificates.map(cert => ({
        ...cert,
        documentType: 'birth_certificate'
      })),
      ...birthDeclarations.map(decl => ({
        ...decl,
        documentType: 'birth_declaration'
      }))
    ];

    // Calculer les statistiques
    const totalRequests = allRequests.length;
    const lastMonthRequests = allRequests.filter(req => new Date(req.createdAt) >= lastMonth).length;
    const pendingRequests = allRequests.filter(req => req.status === 'en_attente').length;
    const validatedRequests = allRequests.filter(req => req.status === 'approuvé').length;
    const rejectedRequests = allRequests.filter(req => req.status === 'rejeté').length;

    // Récupérer les demandes récentes (5 dernières)
    const recentRequests = allRequests
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(req => ({
        _id: req.id,
        documentType: req.documentType,
        status: req.status,
        createdAt: req.createdAt,
        trackingNumber: 'trackingNumber' in req ? req.trackingNumber : null,
        files: 'files' in req ? req.files : []
      }));

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
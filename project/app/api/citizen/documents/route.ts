import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    // Récupérer tous les documents du citoyen, triés par date de création (du plus récent au plus ancien)
    const documents = await prisma.birthCertificate.findMany({
      where: {
        citizenId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        files: true
      }
    });

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
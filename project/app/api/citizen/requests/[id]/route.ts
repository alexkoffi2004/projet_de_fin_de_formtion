import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const requestDetails = await prisma.birthDeclaration.findUnique({
      where: {
        id: params.id,
        citizenId: session.user.id
      },
      include: {
        documents: true,
        payment: true,
        agent: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!requestDetails) {
      return NextResponse.json(
        { success: false, message: 'Demande non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: requestDetails
    });
  } catch (error) {
    console.error('Error fetching request details:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des détails de la demande' },
      { status: 500 }
    );
  }
} 
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
        id: params.id
      },
      include: {
        documents: true,
        payment: true,
        citizen: {
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

export async function PATCH(
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

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Le statut est requis' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Statut invalide' },
        { status: 400 }
      );
    }

    const updatedRequest = await prisma.birthDeclaration.update({
      where: {
        id: params.id
      },
      data: {
        status,
        agentId: status === 'IN_PROGRESS' ? session.user.id : undefined,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour du statut' },
      { status: 500 }
    );
  }
} 
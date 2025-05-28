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

    if (!session || session.user.role !== 'agent') {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const declaration = await prisma.birthDeclaration.findUnique({
      where: { id: params.id },
      include: {
        citizen: {
          select: {
            name: true,
            email: true,
          },
        },
        documents: true,
        payment: true,
      },
    });

    if (!declaration) {
      return NextResponse.json(
        { success: false, message: 'Déclaration non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: declaration });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
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

    if (!session || session.user.role !== 'agent') {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['en_attente', 'approuvé', 'rejeté'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Statut invalide' },
        { status: 400 }
      );
    }

    // Vérifier si l'admin a déjà validé la déclaration
    const existingDeclaration = await prisma.birthDeclaration.findUnique({
      where: { id: params.id },
      select: { status: true }
    });

    if (!existingDeclaration) {
      return NextResponse.json(
        { success: false, message: 'Déclaration non trouvée' },
        { status: 404 }
      );
    }

    // Si l'admin a déjà validé ou rejeté la déclaration, empêcher la modification
    if (existingDeclaration.status === 'approuvé' || existingDeclaration.status === 'rejeté') {
      return NextResponse.json(
        { success: false, message: 'Cette déclaration a déjà été traitée par l\'administrateur' },
        { status: 403 }
      );
    }

    const updatedDeclaration = await prisma.birthDeclaration.update({
      where: { id: params.id },
      data: { status },
      include: {
        citizen: {
          select: {
            name: true,
            email: true,
          },
        },
        documents: true,
        payment: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedDeclaration });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 
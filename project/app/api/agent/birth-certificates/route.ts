import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { trackingNumber: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { citizen: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const requests = await prisma.birthCertificate.findMany({
      where,
      include: {
        citizen: {
          select: {
            name: true,
            email: true
          }
        },
        files: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching birth certificate requests:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des demandes' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID de la demande manquant' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, comment } = body;

    const updatedRequest = await prisma.birthCertificate.update({
      where: { id },
      data: {
        status,
        comment,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error updating birth certificate request:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour de la demande' },
      { status: 500 }
    );
  }
} 
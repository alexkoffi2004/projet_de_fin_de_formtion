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

    const requests = await prisma.birthDeclaration.findMany({
      where: {
        citizenId: session.user.id
      },
      select: {
        id: true,
        childName: true,
        birthDate: true,
        status: true,
        trackingNumber: true,
        createdAt: true
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
    console.error('Error fetching citizen requests:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des demandes' },
      { status: 500 }
    );
  }
} 
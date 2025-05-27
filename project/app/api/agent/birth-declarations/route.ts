import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "agent") {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const birthDeclarations = await prisma.birthDeclaration.findMany({
      include: {
        citizen: {
          select: {
            name: true,
            email: true,
          },
        },
        documents: true,
        payment: true
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: birthDeclarations
    });
  } catch (error) {
    console.error("[BIRTH_DECLARATIONS_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
} 
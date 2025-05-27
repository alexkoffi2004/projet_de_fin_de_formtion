import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BirthCertificate, BirthDeclaration } from '@prisma/client';

type BirthCertificateWithCitizen = BirthCertificate & {
  citizen: {
    name: string | null;
    email: string;
  };
};

type BirthDeclarationWithCitizen = BirthDeclaration & {
  citizen: {
    name: string | null;
    email: string;
  };
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    // Récupérer les actes de naissance
    const birthCertificates = await prisma.birthCertificate.findMany({
      where: {
        status: {
          not: 'DELETED'
        }
      },
      include: {
        citizen: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Récupérer les déclarations de naissance
    const birthDeclarations = await prisma.birthDeclaration.findMany({
      where: {
        status: {
          not: 'DELETED'
        }
      },
      include: {
        citizen: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formater les données pour un affichage uniforme
    const formattedBirthCertificates = birthCertificates.map((cert: BirthCertificateWithCitizen) => ({
      id: cert.id,
      type: 'birth_certificate' as const,
      fullName: cert.fullName,
      birthDate: cert.birthDate,
      birthPlace: cert.birthPlace,
      status: cert.status,
      createdAt: cert.createdAt,
      citizen: {
        name: cert.citizen.name || 'N/A',
        email: cert.citizen.email
      }
    }));

    const formattedBirthDeclarations = birthDeclarations.map((decl: BirthDeclarationWithCitizen) => ({
      id: decl.id,
      type: 'birth_declaration' as const,
      childFirstName: decl.childFirstName,
      childLastName: decl.childLastName,
      birthDate: decl.birthDate,
      birthPlace: decl.birthPlace,
      status: decl.status,
      createdAt: decl.createdAt,
      citizen: {
        name: decl.citizen.name || 'N/A',
        email: decl.citizen.email
      }
    }));

    // Combiner et trier toutes les demandes par date de création
    const allRequests = [...formattedBirthCertificates, ...formattedBirthDeclarations]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({
      success: true,
      data: allRequests
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
} 
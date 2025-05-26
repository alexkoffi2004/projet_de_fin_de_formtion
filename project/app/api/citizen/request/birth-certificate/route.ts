import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour soumettre une demande' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validation des champs requis
    const { fullName, birthDate, birthPlace, fatherFullName, motherFullName, acteNumber, demandeurIdProofUrl, existingActeUrl } = body;

    if (!fullName || !birthDate || !birthPlace || (!fatherFullName && !motherFullName) || !demandeurIdProofUrl) {
      return NextResponse.json(
        { error: 'Certains champs requis sont manquants : Nom complet, Date et lieu de naissance, au moins un parent (père ou mère), Pièce d\'identité du demandeur.' },
        { status: 400 }
      );
    }

    // Récupérer l'ID du citoyen
    const citizen = await prisma.citizen.findUnique({
      where: { email: session.user.email }
    });

    if (!citizen) {
      return NextResponse.json(
        { error: 'Citoyen non trouvé' },
        { status: 404 }
      );
    }

    // Créer la demande d'acte de naissance
    const birthCertificate = await prisma.birthCertificate.create({
      data: {
        citizenId: citizen.id,
        fullName,
        birthDate: new Date(birthDate),
        birthPlace,
        fatherFullName: fatherFullName || null,
        motherFullName: motherFullName || null,
        acteNumber: acteNumber || null,
        status: 'PENDING',
        trackingNumber: nanoid(10), // Génère un numéro de suivi unique
        files: {
          create: [
            {
              type: 'id_proof',
              url: demandeurIdProofUrl
            },
            ...(existingActeUrl ? [{
              type: 'existing_acte',
              url: existingActeUrl
            }] : [])
          ]
        }
      },
      include: {
        files: true
      }
    });

    return NextResponse.json({
      message: 'Demande d\'acte de naissance créée avec succès',
      requestId: birthCertificate.id,
      trackingNumber: birthCertificate.trackingNumber
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de la demande d\'acte de naissance:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la demande' },
      { status: 500 }
    );
  }
}

// Vous pouvez ajouter d'autres méthodes HTTP (GET, PUT, DELETE) si nécessaire pour cet endpoint spécifique 
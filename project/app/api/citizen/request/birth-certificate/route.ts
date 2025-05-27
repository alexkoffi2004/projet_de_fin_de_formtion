import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { 
      fullName, 
      birthDate, 
      birthPlace,
      fatherFullName,
      motherFullName,
      acteNumber,
      demandeurIdProofUrl,
      existingActeUrl 
    } = data;

    if (!fullName || !birthDate || !birthPlace || !demandeurIdProofUrl) {
      return NextResponse.json(
        { success: false, message: 'Tous les champs obligatoires sont requis' },
        { status: 400 }
      );
    }

    const birthCertificate = await prisma.birthCertificate.create({
      data: {
        citizenId: session.user.id,
        fullName,
        birthDate: new Date(birthDate),
        birthPlace,
        fatherFullName: fatherFullName || null,
        motherFullName: motherFullName || null,
        acteNumber: acteNumber || null,
        status: 'PENDING',
        trackingNumber: nanoid(10),
        files: {
          create: [
            {
              type: 'DEMANDEUR_ID',
              url: demandeurIdProofUrl
            },
            ...(existingActeUrl ? [{
              type: 'EXISTING_ACTE',
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
      success: true,
      data: birthCertificate
    });
  } catch (error) {
    console.error('Error creating birth certificate request:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création de la demande' },
      { status: 500 }
    );
  }
}

// Vous pouvez ajouter d'autres méthodes HTTP (GET, PUT, DELETE) si nécessaire pour cet endpoint spécifique 
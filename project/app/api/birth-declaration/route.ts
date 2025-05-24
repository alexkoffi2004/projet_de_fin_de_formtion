import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Vérifier la session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validation des données requises
    const requiredFields = [
      'childFirstName',
      'childLastName',
      'childGender',
      'birthDate',
      'birthPlace',
      'fatherFirstName',
      'fatherLastName',
      'motherFirstName',
      'motherLastName'
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Le champ ${field} est requis` },
          { status: 400 }
        );
      }
    }

    // Créer la déclaration de naissance dans la base de données
    const birthDeclaration = await prisma.birthDeclaration.create({
      data: {
        citizenId: session.user.id,
        childFirstName: data.childFirstName,
        childLastName: data.childLastName,
        childGender: data.childGender,
        birthDate: new Date(data.birthDate),
        birthPlace: data.birthPlace,
        fatherFirstName: data.fatherFirstName,
        fatherLastName: data.fatherLastName,
        motherFirstName: data.motherFirstName,
        motherLastName: data.motherLastName,
        status: 'en_attente',
        documents: {
          create: data.documents?.map((doc: any) => ({
            type: doc.type,
            url: doc.url
          })) || []
        },
        payment: {
          create: {
            amount: 1000,
            status: 'en_attente'
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: birthDeclaration
    });
  } catch (error) {
    console.error('Error creating birth declaration:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la déclaration' },
      { status: 500 }
    );
  }
}

function generateTrackingNumber() {
  const prefix = 'BN';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
} 
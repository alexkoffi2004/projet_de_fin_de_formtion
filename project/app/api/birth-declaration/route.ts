import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Créer la déclaration de naissance dans la base de données
    const birthDeclaration = await prisma.birthDeclaration.create({
      data: {
        childName: data.childName,
        birthDate: new Date(data.birthDate),
        birthTime: data.birthTime,
        birthPlace: data.birthPlace,
        gender: data.gender,
        fatherName: data.fatherName,
        motherName: data.motherName,
        email: data.email,
        status: 'PENDING',
        trackingNumber: generateTrackingNumber(),
        documents: {
          create: {
            parentId: data.parentId,
            birthCertificate: data.birthCertificate,
            familyBook: data.familyBook
          }
        },
        payment: {
          create: {
            amount: 1000,
            method: data.paymentMethod,
            status: 'COMPLETED'
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
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

    // Récupérer tous les documents du citoyen
    const [birthCertificates, birthDeclarations] = await Promise.all([
      prisma.birthCertificate.findMany({
        where: {
          citizenId: session.user.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          files: true
        }
      }),
      prisma.birthDeclaration.findMany({
        where: {
          citizenId: session.user.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          documents: true,
          citizen: true
        }
      })
    ]);

    // Combiner et formater les documents
    const documents = [
      ...birthCertificates.map(cert => ({
        id: cert.id,
        documentType: 'birth_certificate',
        fullName: cert.fullName,
        birthDate: cert.birthDate,
        birthPlace: cert.birthPlace,
        fatherFullName: cert.fatherFullName,
        motherFullName: cert.motherFullName,
        status: cert.status,
        trackingNumber: cert.trackingNumber,
        createdAt: cert.createdAt,
        updatedAt: cert.updatedAt,
        files: cert.files
      })),
      ...birthDeclarations.map(decl => ({
        id: decl.id,
        documentType: 'birth_declaration',
        fullName: `${decl.childFirstName} ${decl.childLastName}`,
        birthDate: decl.birthDate,
        birthPlace: decl.birthPlace,
        fatherFullName: `${decl.fatherFirstName} ${decl.fatherLastName}`,
        motherFullName: `${decl.motherFirstName} ${decl.motherLastName}`,
        status: decl.status,
        trackingNumber: decl.id,
        createdAt: decl.createdAt,
        updatedAt: decl.updatedAt,
        files: decl.documents.map(doc => ({
          type: doc.type,
          url: doc.url
        }))
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des documents' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BirthCertificate, BirthDeclaration, Document } from '@prisma/client';

type BirthCertificateWithFiles = BirthCertificate & {
  files: Document[];
};

type BirthDeclarationWithDocuments = BirthDeclaration & {
  documents: Document[];
};

interface DocumentFile {
  id: string;
  type: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentResponse {
  id: string;
  documentType: 'birth_certificate' | 'birth_declaration';
  fullName: string;
  birthDate: Date;
  birthPlace: string;
  fatherFullName?: string;
  motherFullName?: string;
  status: string;
  trackingNumber: string;
  rejectReason?: string | null;
  comment?: string | null;
  createdAt: Date;
  updatedAt: Date;
  files: DocumentFile[];
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Essayer d'abord de trouver un acte de naissance
    const birthCertificate = await prisma.birthCertificate.findUnique({
      where: {
        id: params.id,
        citizenId: session.user.id
      },
      include: {
        files: true
      }
    }) as BirthCertificateWithFiles | null;

    if (birthCertificate) {
      const response: DocumentResponse = {
        id: birthCertificate.id,
        documentType: 'birth_certificate',
        fullName: birthCertificate.fullName,
        birthDate: birthCertificate.birthDate,
        birthPlace: birthCertificate.birthPlace,
        fatherFullName: birthCertificate.fatherFullName || undefined,
        motherFullName: birthCertificate.motherFullName || undefined,
        status: birthCertificate.status,
        trackingNumber: birthCertificate.trackingNumber,
        rejectReason: (birthCertificate as any).rejectReason,
        comment: birthCertificate.comment,
        createdAt: birthCertificate.createdAt,
        updatedAt: birthCertificate.updatedAt,
        files: birthCertificate.files.map(file => ({
          id: file.id,
          type: file.type,
          url: file.url,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt
        }))
      };

      return NextResponse.json({
        success: true,
        data: response
      });
    }

    // Si ce n'est pas un acte de naissance, chercher une déclaration de naissance
    const birthDeclaration = await prisma.birthDeclaration.findUnique({
      where: {
        id: params.id,
        citizenId: session.user.id
      },
      include: {
        documents: true
      }
    }) as BirthDeclarationWithDocuments | null;

    if (birthDeclaration) {
      const response: DocumentResponse = {
        id: birthDeclaration.id,
        documentType: 'birth_declaration',
        fullName: `${birthDeclaration.childFirstName} ${birthDeclaration.childLastName}`,
        birthDate: birthDeclaration.birthDate,
        birthPlace: birthDeclaration.birthPlace,
        fatherFullName: `${birthDeclaration.fatherFirstName} ${birthDeclaration.fatherLastName}`,
        motherFullName: `${birthDeclaration.motherFirstName} ${birthDeclaration.motherLastName}`,
        status: birthDeclaration.status,
        trackingNumber: birthDeclaration.id,
        rejectReason: (birthDeclaration as any).rejectReason,
        createdAt: birthDeclaration.createdAt,
        updatedAt: birthDeclaration.updatedAt,
        files: birthDeclaration.documents.map(doc => ({
          id: doc.id,
          type: doc.type,
          url: doc.url,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt
        }))
      };

      return NextResponse.json({
        success: true,
        data: response
      });
    }

    return NextResponse.json(
      { success: false, message: 'Document non trouvé' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching document details:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des détails du document' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "agent") {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const birthCertificates = await prisma.birthCertificate.findMany({
      include: {
        citizen: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(birthCertificates);
  } catch (error) {
    console.error("[BIRTH_CERTIFICATES_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "agent") {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const body = await request.json();
    const { documentId, status } = body;

    if (!documentId || !status) {
      return new NextResponse("Données manquantes", { status: 400 });
    }

    // Récupérer le certificat de naissance avec les informations du citoyen
    const birthCertificate = await prisma.birthCertificate.findUnique({
      where: { id: documentId },
      include: { citizen: true },
    });

    if (!birthCertificate) {
      return new NextResponse("Certificat non trouvé", { status: 404 });
    }

    // Mettre à jour le statut du certificat
    const updatedCertificate = await prisma.birthCertificate.update({
      where: {
        id: documentId,
      },
      data: {
        status: status.toUpperCase(),
        agentId: session.user.id,
      },
    });

    // Créer une notification pour le citoyen
    const statusLabel = status === "APPROVED" ? "validée" : status === "REJECTED" ? "rejetée" : "en attente";
    
    await prisma.notification.create({
      data: {
        citizenId: birthCertificate.citizenId,
        title: "Mise à jour de votre demande d'acte de naissance",
        message: `Votre demande d'acte de naissance (${birthCertificate.trackingNumber}) a été ${statusLabel}.`,
        type: "BIRTH_CERTIFICATE",
        referenceId: documentId,
      },
    });

    return NextResponse.json(updatedCertificate);
  } catch (error) {
    console.error("[BIRTH_CERTIFICATES_PUT]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
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

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Statut manquant' },
        { status: 400 }
      );
    }

    const updatedCertificate = await prisma.birthCertificate.update({
      where: {
        id: id,
      },
      data: {
        status: status,
        comment: comment,
        updatedAt: new Date()
      },
    });

    if (!updatedCertificate) {
      return NextResponse.json(
        { success: false, message: 'Demande non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: updatedCertificate
    });

  } catch (error) {
    console.error('Error updating birth certificate request:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour du statut' },
      { status: 500 }
    );
  }
} 
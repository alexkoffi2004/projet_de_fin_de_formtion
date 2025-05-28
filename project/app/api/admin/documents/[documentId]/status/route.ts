import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/types/user";

export async function PATCH(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur est un admin
    const admin = await prisma.user.findUnique({
      where: {
        email: session.user.email,
        role: UserRole.ADMIN,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const { status, rejectReason } = await request.json();
    const { documentId } = params;

    // Vérifier d'abord dans les déclarations de naissance
    const birthDeclaration = await prisma.birthDeclaration.findUnique({
      where: { id: documentId },
      include: {
        citizen: {
          select: {
            name: true,
          },
        },
      },
    });

    if (birthDeclaration) {
      // Mettre à jour le statut de la déclaration de naissance
      const updatedDeclaration = await prisma.birthDeclaration.update({
        where: { id: documentId },
        data: { status },
        include: {
          citizen: {
            select: {
              name: true,
            },
          },
        },
      });

      return NextResponse.json({
        id: updatedDeclaration.id,
        type: "BirthDeclaration",
        status: updatedDeclaration.status,
        createdAt: updatedDeclaration.createdAt,
        updatedAt: updatedDeclaration.updatedAt,
        citizenId: updatedDeclaration.citizenId,
        citizenName: updatedDeclaration.citizen.name
      });
    }

    // Vérifier dans les actes de naissance
    const birthCertificate = await prisma.birthCertificate.findUnique({
      where: { id: documentId },
      include: {
        citizen: {
          select: {
            name: true,
          },
        },
      },
    });

    if (birthCertificate) {
      // Mettre à jour le statut de l'acte de naissance
      const updatedCertificate = await prisma.birthCertificate.update({
        where: { id: documentId },
        data: { 
          status,
          comment: status === "rejeté" ? rejectReason : null
        },
        include: {
          citizen: {
            select: {
              name: true,
            },
          },
        },
      });

      return NextResponse.json({
        id: updatedCertificate.id,
        type: "BirthCertificate",
        status: updatedCertificate.status,
        createdAt: updatedCertificate.createdAt,
        updatedAt: updatedCertificate.updatedAt,
        citizenId: updatedCertificate.citizenId,
        citizenName: updatedCertificate.citizen.name,
        comment: updatedCertificate.comment
      });
    }

    return NextResponse.json(
      { error: "Document non trouvé" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut" },
      { status: 500 }
    );
  }
} 
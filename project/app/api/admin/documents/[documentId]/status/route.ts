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

    const { status } = await request.json();
    const { documentId } = params;

    // Vérifier d'abord dans les déclarations de naissance
    let document = await prisma.birthDeclaration.findUnique({
      where: { id: documentId },
      include: {
        citizen: {
          select: {
            name: true,
          },
        },
      },
    });

    if (document) {
      // Mettre à jour le statut de la déclaration de naissance
      document = await prisma.birthDeclaration.update({
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
    } else {
      // Vérifier dans les actes de naissance
      document = await prisma.birthCertificate.findUnique({
        where: { id: documentId },
        include: {
          citizen: {
            select: {
              name: true,
            },
          },
        },
      });

      if (document) {
        // Mettre à jour le statut de l'acte de naissance
        document = await prisma.birthCertificate.update({
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
      } else {
        return NextResponse.json(
          { error: "Document non trouvé" },
          { status: 404 }
        );
      }
    }

    // Transformer la réponse dans un format uniforme
    const response = {
      id: document.id,
      type: document instanceof prisma.birthDeclaration ? "BirthDeclaration" : "BirthCertificate",
      status: document.status,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      citizenId: document.citizenId,
      citizenName: document.citizen.name,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut" },
      { status: 500 }
    );
  }
} 
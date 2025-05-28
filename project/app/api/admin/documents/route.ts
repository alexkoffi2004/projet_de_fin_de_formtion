import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/types/user";

// GET - Récupérer tous les documents
export async function GET() {
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

    // Récupérer toutes les déclarations de naissance
    const birthDeclarations = await prisma.birthDeclaration.findMany({
      include: {
        citizen: {
          select: {
            name: true,
          },
        },
      },
    });

    // Récupérer tous les actes de naissance
    const birthCertificates = await prisma.birthCertificate.findMany({
      include: {
        citizen: {
          select: {
            name: true,
          },
        },
      },
    });

    // Transformer les données pour un format uniforme
    const documents = [
      ...birthDeclarations.map((doc) => ({
        id: doc.id,
        type: "BirthDeclaration",
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        citizenId: doc.citizenId,
        citizenName: doc.citizen.name,
      })),
      ...birthCertificates.map((doc) => ({
        id: doc.id,
        type: "BirthCertificate",
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        citizenId: doc.citizenId,
        citizenName: doc.citizen.name,
      })),
    ];

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des documents" },
      { status: 500 }
    );
  }
} 
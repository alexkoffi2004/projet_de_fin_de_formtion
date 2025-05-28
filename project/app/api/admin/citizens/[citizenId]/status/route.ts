import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { citizenId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    if (session.user.role !== "admin") {
      return new NextResponse("Accès refusé", { status: 403 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return new NextResponse("Le statut est requis", { status: 400 });
    }

    const citizen = await prisma.citizen.update({
      where: {
        id: params.citizenId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(citizen);
  } catch (error) {
    console.error("[CITIZEN_STATUS_PATCH]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
} 
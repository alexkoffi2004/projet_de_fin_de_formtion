import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "citizen") {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        citizenId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "citizen") {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return new NextResponse("ID de notification manquant", { status: 400 });
    }

    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        citizenId: session.user.id,
      },
      data: {
        status: "READ",
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("[NOTIFICATIONS_PATCH]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
} 
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    if (session.user.role !== "admin") {
      return new NextResponse("Accès refusé", { status: 403 });
    }

    const citizens = await prisma.citizen.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(citizens);
  } catch (error) {
    console.error("[CITIZENS_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    if (session.user.role !== "admin") {
      return new NextResponse("Accès refusé", { status: 403 });
    }

    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return new NextResponse("Email et mot de passe requis", { status: 400 });
    }

    const existingCitizen = await prisma.citizen.findUnique({
      where: { email },
    });

    if (existingCitizen) {
      return new NextResponse("Cet email est déjà utilisé", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const citizen = await prisma.citizen.create({
      data: {
        name,
        email,
        hashedPassword,
        role: "citizen",
        status: "active",
      },
    });

    return NextResponse.json(citizen);
  } catch (error) {
    console.error("[CITIZENS_POST]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
} 
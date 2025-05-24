import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { UserRole } from '@/types/user';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(
        JSON.stringify({ status: "error", message: "Non autorisé" }),
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur est un admin
    if (session.user.role !== UserRole.ADMIN) {
      return new NextResponse(
        JSON.stringify({ status: "error", message: "Accès non autorisé" }),
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("mairie_db");
    const collection = db.collection("agents");

    const agents = await collection
      .find({})
      .project({ password: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    return new NextResponse(
      JSON.stringify({
        status: "success",
        data: agents
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des agents:', error);
    return new NextResponse(
      JSON.stringify({ 
        status: "error",
        message: "Erreur lors de la récupération des agents"
      }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(
        JSON.stringify({ status: "error", message: "Non autorisé" }),
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur est un admin
    if (session.user.role !== UserRole.ADMIN) {
      return new NextResponse(
        JSON.stringify({ status: "error", message: "Accès non autorisé" }),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, name, password } = body;

    const client = await clientPromise;
    const db = client.db("mairie_db");
    const collection = db.collection("agents");

    // Vérifier si l'email existe déjà
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ 
          status: "error",
          message: "Cet email est déjà utilisé"
        }),
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'agent
    const agent = {
      email,
      name,
      password: hashedPassword,
      role: UserRole.AGENT,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(agent);

    // Retourner les informations de l'agent sans le mot de passe hashé
    const { password: _, ...agentWithoutPassword } = agent;

    return new NextResponse(
      JSON.stringify({
        status: "success",
        message: "Agent créé avec succès",
        data: { ...agentWithoutPassword, _id: result.insertedId },
        credentials: {
          email,
          password // Retourner le mot de passe en clair pour l'administrateur
        }
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la création de l\'agent:', error);
    return new NextResponse(
      JSON.stringify({ 
        status: "error",
        message: "Erreur lors de la création de l'agent"
      }),
      { status: 500 }
    );
  }
} 
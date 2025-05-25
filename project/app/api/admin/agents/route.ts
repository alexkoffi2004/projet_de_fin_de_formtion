import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Récupérer tous les agents
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user?.email) {
      console.log('Pas de session ou email manquant');
      return NextResponse.json(
        { error: 'Vous devez être connecté pour accéder à cette ressource' },
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur est un admin avec Prisma
    const user = await prisma.user.findUnique({
      where: { 
        email: session.user.email,
        role: 'admin'
      }
    });
    console.log('Utilisateur trouvé:', user);

    if (!user) {
      console.log('Utilisateur non trouvé ou non admin');
      return NextResponse.json(
        { error: 'Vous devez être administrateur pour accéder à cette ressource' },
        { status: 403 }
      );
    }

    // Récupérer tous les agents depuis MongoDB
    const { db } = await connectToDatabase();
    const agents = await db.collection('Agent')
      .find()
      .project({ password: 0 }) // Exclure le mot de passe
      .toArray();

    console.log('Nombre d\'agents trouvés:', agents.length);
    return NextResponse.json(agents);
  } catch (error) {
    console.error('Erreur détaillée lors de la récupération des agents:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des agents' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel agent
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    // Vérifier si l'utilisateur est un admin
    const admin = await db.collection('admins').findOne({ email: session.user.email });
    if (!admin) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, nom, prenom, role } = body;

    // Vérifier si l'email existe déjà
    const existingAgent = await db.collection('Agent').findOne({ email });
    if (existingAgent) {
      return NextResponse.json(
        { error: 'Un agent avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le nouvel agent
    const newAgent = {
      email,
      password: hashedPassword,
      nom,
      prenom,
      role: role || 'agent', // Par défaut, le rôle est 'agent'
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('Agent').insertOne(newAgent);

    // Retourner l'agent créé sans le mot de passe
    const { password: _, ...agentWithoutPassword } = newAgent;
    return NextResponse.json(agentWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'agent:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'agent' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un agent
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    // Vérifier si l'utilisateur est un admin
    const admin = await db.collection('admins').findOne({ email: session.user.email });
    if (!admin) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const agentId = url.searchParams.get('id');

    if (!agentId) {
      return NextResponse.json(
        { error: 'ID de l\'agent requis' },
        { status: 400 }
      );
    }

    const result = await db.collection('Agent').deleteOne({ _id: agentId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Agent non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Agent supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'agent:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'agent' },
      { status: 500 }
    );
  }
} 
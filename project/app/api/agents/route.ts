import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validation des données
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Vérifier si l'email existe déjà
    const existingUser = await db.collection('agents').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le nouvel agent
    const newAgent = {
      name,
      email,
      password: hashedPassword,
      role: 'agent',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insérer dans la collection agents
    const result = await db.collection('agents').insertOne(newAgent);

    // Retourner l'agent créé (sans le mot de passe)
    const createdAgent = {
      id: result.insertedId,
      name,
      email,
      role: 'agent',
      status: 'active'
    };

    return NextResponse.json(createdAgent, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'agent:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'agent' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Récupérer tous les agents
    const agents = await db.collection('agents')
      .find({}, { projection: { password: 0 } })
      .toArray();

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Erreur lors de la récupération des agents:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des agents' },
      { status: 500 }
    );
  }
} 
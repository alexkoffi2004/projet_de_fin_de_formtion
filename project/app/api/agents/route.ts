import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    console.log('Création d\'un nouvel agent:', { name, email });

    // Validation des données
    if (!name || !email || !password) {
      console.log('Données manquantes:', { name: !!name, email: !!email, password: !!password });
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    console.log('Connexion à la base de données établie');

    // Vérifier si l'email existe déjà
    const existingUser = await db.collection('agents').findOne({ email });
    if (existingUser) {
      console.log('Email déjà utilisé:', email);
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Mot de passe hashé');

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
    console.log('Agent créé avec succès:', result.insertedId);

    // Vérifier que l'agent a bien été créé
    const createdAgent = await db.collection('agents').findOne({ _id: result.insertedId });
    console.log('Agent créé:', {
      id: createdAgent._id,
      email: createdAgent.email,
      name: createdAgent.name,
      role: createdAgent.role,
      status: createdAgent.status
    });

    // Retourner l'agent créé (sans le mot de passe)
    const response = {
      id: result.insertedId,
      name,
      email,
      role: 'agent',
      status: 'active'
    };

    return NextResponse.json(response, { status: 201 });
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
    console.log('Récupération de tous les agents');
    
    // Récupérer tous les agents
    const agents = await db.collection('agents')
      .find({}, { projection: { password: 0 } })
      .toArray();

    console.log('Nombre d\'agents trouvés:', agents.length);
    console.log('Agents:', agents.map(a => ({ email: a.email, name: a.name })));

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Erreur lors de la récupération des agents:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des agents' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    console.log('Création d\'un agent de test:', { name, email });

    const { db } = await connectToDatabase();
    
    // Vérifier si l'agent existe déjà
    const existingAgent = await db.collection('agents').findOne({ email });
    if (existingAgent) {
      console.log('Agent existant trouvé:', existingAgent);
      return NextResponse.json({
        status: 'exists',
        message: 'Agent déjà existant',
        agent: {
          email: existingAgent.email,
          name: existingAgent.name,
          role: existingAgent.role,
          status: existingAgent.status
        }
      });
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
    console.log('Agent créé avec succès:', result.insertedId);

    // Vérifier que l'agent a bien été créé
    const createdAgent = await db.collection('agents').findOne({ _id: result.insertedId });
    if (!createdAgent) {
      throw new Error('Agent non trouvé après création');
    }

    return NextResponse.json({
      status: 'success',
      message: 'Agent créé avec succès',
      agent: {
        id: createdAgent._id,
        email: createdAgent.email,
        name: createdAgent.name,
        role: createdAgent.role,
        status: createdAgent.status
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'agent de test:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Erreur lors de la création de l\'agent',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 
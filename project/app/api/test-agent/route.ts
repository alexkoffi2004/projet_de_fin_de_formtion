import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    // Vérifier la variable d'environnement
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI non définie');
      return NextResponse.json({ 
        error: 'Configuration de la base de données manquante',
        details: 'MONGODB_URI non définie'
      }, { status: 500 });
    }

    const { email } = await request.json();
    console.log('Email reçu:', email);

    const { db } = await connectToDatabase();
    console.log('Connexion à la base de données établie');
    
    // Lister toutes les collections pour vérifier
    const collections = await db.listCollections().toArray();
    console.log('Collections disponibles:', collections.map(c => c.name));
    
    // Vérifier le contenu de la collection agents
    const allAgents = await db.collection('agents').find({}).toArray();
    console.log('Tous les agents:', allAgents);
    
    const agent = await db.collection('agents').findOne({ email });
    console.log('Agent recherché:', agent);
    
    if (!agent) {
      return NextResponse.json({ 
        exists: false,
        message: "Agent non trouvé",
        debug: {
          emailRecherche: email,
          collections: collections.map(c => c.name),
          nombreAgents: allAgents.length,
          uri: process.env.MONGODB_URI ? 'définie' : 'non définie'
        }
      });
    }

    return NextResponse.json({ 
      exists: true,
      message: "Agent trouvé",
      agent: {
        email: agent.email,
        name: agent.name,
        status: agent.status
      }
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'agent:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la vérification de l\'agent',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 
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
    console.log('Nombre total d\'agents:', allAgents.length);
    
    // Afficher la structure exacte du premier agent pour debug
    if (allAgents.length > 0) {
      console.log('Structure du premier agent:', JSON.stringify(allAgents[0], null, 2));
    }

    // Rechercher l'agent avec une requête plus flexible
    const agent = await db.collection('agents').findOne({
      $or: [
        { email: email },
        { email: email.toLowerCase() },
        { email: email.toUpperCase() }
      ]
    });

    // Si l'agent n'est pas trouvé, afficher tous les agents pour debug
    if (!agent) {
      console.log('Structure des agents dans la base:');
      allAgents.forEach((a, index) => {
        console.log(`Agent ${index + 1}:`, {
          email: a.email,
          name: a.name,
          role: a.role,
          status: a.status,
          _id: a._id,
          password: a.password ? 'présent' : 'absent'
        });
      });

      return NextResponse.json({ 
        exists: false,
        message: "Agent non trouvé",
        debug: {
          emailRecherche: email,
          nombreAgents: allAgents.length,
          agents: allAgents.map(a => ({
            email: a.email,
            name: a.name,
            role: a.role,
            status: a.status,
            hasPassword: !!a.password
          }))
        }
      });
    }

    return NextResponse.json({ 
      exists: true,
      message: "Agent trouvé",
      agent: {
        email: agent.email,
        name: agent.name,
        role: agent.role,
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
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("test");
    
    // Test de la connexion en listant les collections
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({ 
      status: "success",
      message: "Connexion à MongoDB Atlas réussie",
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error);
    return NextResponse.json({ 
      status: "error",
      message: "Échec de la connexion à MongoDB Atlas",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    }, { status: 500 });
  }
} 
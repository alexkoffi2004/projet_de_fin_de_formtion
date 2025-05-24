import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Citizen } from '@/types/citizen';
import bcrypt from 'bcryptjs';

// Configuration pour forcer le mode dynamique
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Configuration CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Route pour créer un nouveau citoyen
export async function POST(request: Request) {
  // Vérifier si c'est une requête OPTIONS (pre-flight)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers: corsHeaders });
  }

  try {
    console.log('Début de la requête POST /api/citizens');
    
    // Vérifier la connexion MongoDB
    const client = await clientPromise;
    console.log('Connexion MongoDB établie');
    
    const db = client.db("mairie_db");
    console.log('Base de données sélectionnée');
    
    const collection = db.collection("citizens");
    console.log('Collection sélectionnée');

    const body = await request.json();
    console.log('Données reçues:', { ...body, password: '[REDACTED]' });
    
    // Validation des données requises
    const requiredFields = ['nom', 'prenom', 'dateNaissance', 'lieuNaissance', 'adresse', 'numeroTelephone', 'email', 'password'];
    for (const field of requiredFields) {
      if (!body[field]) {
        console.log(`Champ manquant: ${field}`);
        return new NextResponse(
          JSON.stringify({ 
            status: "error",
            message: `Le champ ${field} est requis`
          }), 
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        );
      }
    }

    // Vérifier si l'email existe déjà
    const existingEmail = await collection.findOne({ email: body.email });
    if (existingEmail) {
      console.log('Email déjà utilisé:', body.email);
      return new NextResponse(
        JSON.stringify({ 
          status: "error",
          message: "Un citoyen avec cet email existe déjà"
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(body.password, 10);
    console.log('Mot de passe hashé');

    // Créer le nouveau citoyen
    const newCitizen: Citizen = {
      ...body,
      password: hashedPassword,
      dateInscription: new Date(),
      statut: 'actif',
      role: 'citizen'
    };

    // Supprimer le mot de passe de confirmation avant l'enregistrement
    delete newCitizen.confirmPassword;

    console.log('Tentative d\'insertion dans la base de données');
    const result = await collection.insertOne(newCitizen);
    console.log('Insertion réussie, ID:', result.insertedId);

    // Ne pas renvoyer le mot de passe dans la réponse
    const { password, ...citizenWithoutPassword } = newCitizen;

    return new NextResponse(
      JSON.stringify({ 
        status: "success",
        message: "Citoyen inscrit avec succès",
        data: { ...citizenWithoutPassword, _id: result.insertedId }
      }), 
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );

  } catch (error) {
    console.error('Erreur détaillée lors de l\'inscription du citoyen:', error);
    return new NextResponse(
      JSON.stringify({ 
        status: "error",
        message: "Erreur lors de l'inscription du citoyen",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
}

// Route pour récupérer tous les citoyens
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("mairie_db");
    const collection = db.collection("citizens");

    const citizens = await collection.find({}, { projection: { password: 0 } }).toArray();

    return new NextResponse(
      JSON.stringify({ 
        status: "success",
        data: citizens
      }), 
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );

  } catch (error) {
    console.error('Erreur lors de la récupération des citoyens:', error);
    return new NextResponse(
      JSON.stringify({ 
        status: "error",
        message: "Erreur lors de la récupération des citoyens",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
}

// Gérer les requêtes OPTIONS pour CORS
export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
} 
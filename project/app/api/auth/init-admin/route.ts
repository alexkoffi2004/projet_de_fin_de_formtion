import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/types/user';

const ADMIN_EMAIL = 'admin@mairie.com';
const ADMIN_PASSWORD = 'Admin@123'; // À changer en production

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("mairie_db");
    const collection = db.collection("users");

    // Vérifier si l'admin existe déjà
    const existingAdmin = await collection.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      return new NextResponse(
        JSON.stringify({ 
          status: "error",
          message: "L'administrateur existe déjà"
        }), 
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Créer l'administrateur
    const admin = {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: "Administrateur",
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await collection.insertOne(admin);

    return new NextResponse(
      JSON.stringify({
        status: "success",
        message: "Administrateur créé avec succès"
      }),
      { status: 201 }
    );

  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
    return new NextResponse(
      JSON.stringify({ 
        status: "error",
        message: "Erreur lors de la création de l'administrateur"
      }), 
      { status: 500 }
    );
  }
} 
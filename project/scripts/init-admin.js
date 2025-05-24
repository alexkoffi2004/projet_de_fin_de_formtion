const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { UserRole } = require('../types/user');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'mairie_db';
const ADMIN_EMAIL = 'admin@mairie.com';
const ADMIN_PASSWORD = 'Admin@123';

async function initAdmin() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connecté à MongoDB');

    const db = client.db(DB_NAME);
    const collection = db.collection('users');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await collection.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('L\'administrateur existe déjà');
      return;
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
    console.log('Administrateur créé avec succès');

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await client.close();
  }
}

initAdmin(); 
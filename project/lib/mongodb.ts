import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // En développement, utilisez une variable globale pour que la valeur
  // soit préservée entre les rechargements de module causés par HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // En production, il est préférable de ne pas utiliser de variable globale.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Exportez une variable globale pour éviter les connexions multiples
export default clientPromise;

// Fonction pour se connecter à la base de données mairie_db
export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db('mairie_db');
  return { db, client };
} 
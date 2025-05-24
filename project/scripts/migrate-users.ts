import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();
const mongoClient = new MongoClient(process.env.DATABASE_URL || '');

async function migrateUsers() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoClient.connect();
    console.log('Connected to MongoDB Atlas');

    const db = mongoClient.db('mairie_db');
    const citizens = await db.collection('citizens').find({}).toArray();

    console.log(`Found ${citizens.length} citizens to migrate`);

    for (const citizen of citizens) {
      try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.$queryRaw`
          SELECT * FROM "User" WHERE email = ${citizen.email}
        `;

        if (!existingUser || existingUser.length === 0) {
          // Hasher le mot de passe
          const hashedPassword = await bcrypt.hash(citizen.password, 10);

          // Créer l'utilisateur dans Prisma
          await prisma.$executeRaw`
            INSERT INTO "User" (email, name, "hashedPassword", role, "createdAt", "updatedAt")
            VALUES (
              ${citizen.email},
              ${`${citizen.prenom} ${citizen.nom}`},
              ${hashedPassword},
              'citizen',
              NOW(),
              NOW()
            )
          `;

          console.log(`Successfully migrated user: ${citizen.email}`);
        } else {
          console.log(`User already exists in Prisma: ${citizen.email}`);
        }
      } catch (error) {
        console.error(`Error migrating user ${citizen.email}:`, error);
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoClient.close();
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrateUsers().catch(console.error); 
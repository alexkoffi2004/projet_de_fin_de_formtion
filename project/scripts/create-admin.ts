import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'kouadiojeanalexkoffi@gmail.com',
      },
    });

    if (existingUser) {
      console.log('Utilisateur existant trouvé:', {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      });
    } else {
      // Créer un nouvel utilisateur citoyen
      const hashedPassword = await hash('citizen123', 12);
      const newUser = await prisma.user.create({
        data: {
          email: 'kouadiojeanalexkoffi@gmail.com',
          name: 'Citoyen',
          role: 'citizen',
          hashedPassword,
        },
      });

      console.log('Nouvel utilisateur citoyen créé:', {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
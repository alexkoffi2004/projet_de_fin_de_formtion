import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Vérifier et créer l'admin
    const adminEmail = 'admin@mairie.com';
    let admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!admin) {
      const hashedPassword = await hash('Admin@123', 10);
      admin = await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Admin',
          hashedPassword,
          role: 'admin'
        }
      });
      console.log('Admin créé:', admin);
    } else {
      console.log('Admin existe déjà:', admin);
    }

    // Vérifier et créer le citoyen
    const citizenEmail = 'kouadiojeanalexkoffi@gmail.com';
    let citizen = await prisma.citizen.findUnique({
      where: { email: citizenEmail }
    });

    if (!citizen) {
      const hashedPassword = await hash('9alex345', 10);
      citizen = await prisma.citizen.create({
        data: {
          email: citizenEmail,
          name: 'Kouadio Jean Alex Koffi',
          hashedPassword,
          role: 'citizen'
        }
      });
      console.log('Citoyen créé:', citizen);
    } else {
      console.log('Citoyen existe déjà:', citizen);
    }

    // Vérifier et créer l'agent
    const agentEmail = 'alexkoffi@gmail.com';
    let agent = await prisma.agent.findUnique({
      where: { email: agentEmail }
    });

    if (!agent) {
      const hashedPassword = await hash('9alex345', 10);
      agent = await prisma.agent.create({
        data: {
          email: agentEmail,
          firstName: 'Alex',
          lastName: 'Koffi',
          hashedPassword,
          role: 'agent'
        }
      });
      console.log('Agent créé:', agent);
    } else {
      console.log('Agent existe déjà:', agent);
    }

  } catch (error) {
    console.error('Erreur lors de la création des utilisateurs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
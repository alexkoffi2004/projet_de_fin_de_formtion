import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Vérifier dans la collection citizens
    const citizen = await db.collection('citizens').findOne({ email });
    if (citizen) {
      const isPasswordValid = await bcrypt.compare(password, citizen.password);
      if (isPasswordValid) {
        const token = sign(
          { 
            id: citizen._id,
            email: citizen.email,
            role: 'citizen'
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '1d' }
        );

        return NextResponse.json({
          token,
          user: {
            id: citizen._id,
            email: citizen.email,
            name: `${citizen.prenom} ${citizen.nom}`,
            role: 'citizen'
          }
        });
      }
    }

    // Vérifier dans la collection agents
    const agent = await db.collection('agents').findOne({ email });
    if (agent) {
      const isPasswordValid = await bcrypt.compare(password, agent.password);
      if (isPasswordValid) {
        const token = sign(
          { 
            id: agent._id,
            email: agent.email,
            role: 'agent'
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '1d' }
        );

        return NextResponse.json({
          token,
          user: {
            id: agent._id,
            email: agent.email,
            name: `${agent.prenom} ${agent.nom}`,
            role: 'agent'
          }
        });
      }
    }

    // Vérifier dans la collection users (admins)
    const admin = await db.collection('users').findOne({ email });
    if (admin) {
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (isPasswordValid) {
        const token = sign(
          { 
            id: admin._id,
            email: admin.email,
            role: 'admin'
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '1d' }
        );

        return NextResponse.json({
          token,
          user: {
            id: admin._id,
            email: admin.email,
            name: admin.name,
            role: 'admin'
          }
        });
      }
    }

    return NextResponse.json(
      { error: 'Email ou mot de passe incorrect' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
} 
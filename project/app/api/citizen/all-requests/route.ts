import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const citizen = await db.collection('citizens').findOne({ email: session.user.email });

    if (!citizen) {
      return NextResponse.json(
        { error: 'Citoyen non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer toutes les demandes
    const allRequests = await db.collection('documents')
      .find({ citizenEmail: session.user.email })
      .sort({ createdAt: -1 })
      .toArray();

    // Formater les demandes pour l'affichage
    const formattedRequests = allRequests.map(request => ({
      id: request._id.toString(),
      type: request.type,
      date: new Date(request.createdAt).toLocaleDateString('fr-FR'),
      status: request.status === 'en_attente' ? 'En traitement' :
              request.status === 'valide' ? 'Validé' :
              request.status === 'rejete' ? 'Rejeté' : request.status
    }));

    return NextResponse.json(formattedRequests);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des demandes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'historique des demandes' },
      { status: 500 }
    );
  }
} 
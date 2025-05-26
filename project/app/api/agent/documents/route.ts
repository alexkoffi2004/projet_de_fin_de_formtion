import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';

// GET - Récupérer tous les documents ou un document spécifique
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user?.email) {
      console.log('Pas de session ou email manquant');
      return NextResponse.json(
        { error: 'Vous devez être connecté pour accéder à cette ressource' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    // Vérifier si l'utilisateur est un agent
    const agent = await db.collection('Agent').findOne({ email: session.user.email });
    console.log('Agent trouvé:', agent);

    if (!agent) {
      console.log('Utilisateur non trouvé ou non agent');
      return NextResponse.json(
        { error: 'Vous devez être un agent pour accéder à cette ressource' },
        { status: 403 }
      );
    }

    // Récupérer l'ID du document depuis l'URL si présent
    const url = new URL(request.url);
    const documentId = url.searchParams.get('id');

    if (documentId) {
      // Récupérer un document spécifique
      const document = await db.collection('documents').findOne({
        _id: new ObjectId(documentId)
      });

      if (!document) {
        return NextResponse.json(
          { error: 'Document non trouvé' },
          { status: 404 }
        );
      }

      // Récupérer les informations du citoyen
      const citizen = await db.collection('citizens').findOne({ email: document.citizenEmail });

      const documentWithCitizen = {
        id: document._id.toString(),
        type: document.type,
        date: new Date(document.createdAt).toLocaleDateString('fr-FR'),
        status: document.status === 'en_attente' ? 'En traitement' :
                document.status === 'valide' ? 'Validé' :
                document.status === 'rejete' ? 'Rejeté' : document.status,
        citizen: {
          name: citizen ? `${citizen.prenom} ${citizen.nom}` : 'Inconnu',
          email: document.citizenEmail
        }
      };

      return NextResponse.json(documentWithCitizen);
    } else {
      // Récupérer les documents associés à l'agent
      const documents = await db.collection('documents')
        .find({ agentId: agent._id })
        .toArray();

      console.log('Nombre de documents trouvés:', documents.length);
      return NextResponse.json(documents);
    }
  } catch (error) {
    console.error('Erreur détaillée lors de la récupération des documents:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des documents' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour le statut d'un document
export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const agent = await db.collection('agents').findOne({ email: session.user.email });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent non trouvé' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { documentId, status } = body;

    // Mettre à jour le document
    const result = await db.collection('documents').updateOne(
      { _id: new ObjectId(documentId) },
      { 
        $set: { 
          status: status === 'Validé' ? 'valide' :
                 status === 'Rejeté' ? 'rejete' :
                 status === 'En traitement' ? 'en_attente' : status,
          agentEmail: session.user.email,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'Statut mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du document' },
      { status: 500 }
    );
  }
} 
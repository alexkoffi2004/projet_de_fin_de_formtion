import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Récupérer tous les documents ou un document spécifique
export async function GET(request: Request) {
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
      // Récupérer tous les documents
      const documents = await db.collection('documents')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      // Pour chaque document, récupérer les informations du citoyen
      const documentsWithCitizen = await Promise.all(documents.map(async (doc) => {
        const citizen = await db.collection('citizens').findOne({ email: doc.citizenEmail });
        return {
          id: doc._id.toString(),
          type: doc.type,
          date: new Date(doc.createdAt).toLocaleDateString('fr-FR'),
          status: doc.status === 'en_attente' ? 'En traitement' :
                  doc.status === 'valide' ? 'Validé' :
                  doc.status === 'rejete' ? 'Rejeté' : doc.status,
          citizen: {
            name: citizen ? `${citizen.prenom} ${citizen.nom}` : 'Inconnu',
            email: doc.citizenEmail
          }
        };
      }));

      return NextResponse.json(documentsWithCitizen);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des documents' },
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
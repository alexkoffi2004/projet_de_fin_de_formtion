import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';

// GET - Récupérer tous les documents ou un document spécifique
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    // Vérifier si l'utilisateur est un agent
    const agent = await db.collection('agents').findOne({ email: session.user.email });
    if (!agent) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
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
      // Récupérer toutes les demandes avec pagination et tri
      const documents = await db.collection('documents')
        .find()
        .sort({ createdAt: -1 }) // Trier par date de création décroissante
        .toArray();

      // Transformer les données pour inclure les informations nécessaires
      const formattedDocuments = documents.map(doc => ({
        _id: doc._id,
        documentType: doc.documentType,
        status: doc.status,
        createdAt: doc.createdAt,
        citizenEmail: doc.citizenEmail,
        reason: doc.reason,
        additionalInfo: doc.additionalInfo,
        urgency: doc.urgency,
        files: doc.files || [],
        validationDate: doc.validationDate,
        rejectionReason: doc.rejectionReason,
        validatedBy: doc.validatedBy
      }));

      return NextResponse.json(formattedDocuments);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des demandes' },
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
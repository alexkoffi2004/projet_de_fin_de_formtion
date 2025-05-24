import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { RequestStatus } from '@/types/request';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(
        JSON.stringify({ status: "error", message: "Non autorisé" }),
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur est un agent
    if (session.user.role !== 'AGENT') {
      return new NextResponse(
        JSON.stringify({ status: "error", message: "Accès non autorisé" }),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!Object.values(RequestStatus).includes(status)) {
      return new NextResponse(
        JSON.stringify({ status: "error", message: "Statut invalide" }),
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("mairie_db");
    const collection = db.collection("requests");

    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          status,
          updatedAt: new Date(),
          assignedTo: session.user.id
        }
      }
    );

    if (result.matchedCount === 0) {
      return new NextResponse(
        JSON.stringify({ status: "error", message: "Demande non trouvée" }),
        { status: 404 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        status: "success",
        message: "Statut mis à jour avec succès"
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return new NextResponse(
      JSON.stringify({ 
        status: "error",
        message: "Erreur lors de la mise à jour du statut"
      }),
      { status: 500 }
    );
  }
} 
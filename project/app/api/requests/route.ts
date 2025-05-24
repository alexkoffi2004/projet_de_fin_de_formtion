import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Request, RequestStatus } from '@/types/request';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(
        JSON.stringify({ status: "error", message: "Non autorisé" }),
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("mairie_db");
    const collection = db.collection("requests");

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const query = userId ? { userId } : {};
    const requests = await collection.find(query).sort({ createdAt: -1 }).toArray();

    return new NextResponse(
      JSON.stringify({
        status: "success",
        data: requests
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    return new NextResponse(
      JSON.stringify({ 
        status: "error",
        message: "Erreur lors de la récupération des demandes"
      }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(
        JSON.stringify({ status: "error", message: "Non autorisé" }),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, description, documents } = body;

    const client = await clientPromise;
    const db = client.db("mairie_db");
    const collection = db.collection("requests");

    const newRequest: Request = {
      userId: session.user.id,
      type,
      status: RequestStatus.PENDING,
      description,
      documents,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newRequest);

    return new NextResponse(
      JSON.stringify({
        status: "success",
        message: "Demande créée avec succès",
        data: { ...newRequest, _id: result.insertedId }
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la création de la demande:', error);
    return new NextResponse(
      JSON.stringify({ 
        status: "error",
        message: "Erreur lors de la création de la demande"
      }),
      { status: 500 }
    );
  }
} 
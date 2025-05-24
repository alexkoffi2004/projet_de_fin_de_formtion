import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("your_database_name");
    
    const data = await db.collection("your_collection").find({}).toArray();
    
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("your_database_name");
    
    const body = await request.json();
    
    const result = await db.collection("your_collection").insertOne(body);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: "Failed to insert data" }, { status: 500 });
  }
} 
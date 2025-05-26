import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour soumettre une demande' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    // Optionnel: Vérifier si le citoyen existe dans la collection 'citizens' si nécessaire
    // const citizen = await db.collection('citizens').findOne({ email: session.user.email });
    // if (!citizen) {
    //   return NextResponse.json(
    //     { error: 'Citoyen non trouvé' },
    //     { status: 404 }
    //   );
    // }

    const body = await request.json();

    // Validation basique des champs requis du formulaire ActeNaissanceForm
    const { fullName, birthDate, birthPlace, fatherFullName, motherFullName, acteNumber, demandeurIdProofUrl, existingActeUrl } = body;

    if (!fullName || !birthDate || !birthPlace || (!fatherFullName && !motherFullName) || !demandeurIdProofUrl) {
       return NextResponse.json(
         { error: 'Certains champs requis sont manquants : Nom complet, Date et lieu de naissance, au moins un parent (père ou mère), Pièce d\'identité du demandeur.' },
         { status: 400 }
       );
    }

    // Créer le document de demande pour la collection 'documents'
    const demandeActeNaissance = {
      citizenEmail: session.user.email, // Lier la demande au citoyen par email
      documentType: 'birth_certificate', // Type de document
      status: 'en_attente', // Statut initial
      createdAt: new Date(),
      updatedAt: new Date(),
      // Champs spécifiques à l'acte de naissance
      details: {
        fullName: fullName,
        birthDate: new Date(birthDate), // Stocker comme Date
        birthPlace: birthPlace,
        fatherFullName: fatherFullName || null,
        motherFullName: motherFullName || null,
        acteNumber: acteNumber || null,
        demandeurIdProofUrl: demandeurIdProofUrl,
        existingActeUrl: existingActeUrl || null,
      },
       // Vous pouvez ajouter d'autres champs communs ici si besoin (ex: raison, urgence)
       // reason: body.reason, 
       // urgency: body.urgency,
    };

    // Insérer la demande dans la collection 'documents'
    const result = await db.collection('documents').insertOne(demandeActeNaissance);

    return NextResponse.json({
      message: 'Demande d\'acte de naissance créée avec succès',
      requestId: result.insertedId,
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de la demande d\'acte de naissance:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la demande' },
      { status: 500 }
    );
  }
}

// Vous pouvez ajouter d'autres méthodes HTTP (GET, PUT, DELETE) si nécessaire pour cet endpoint spécifique 
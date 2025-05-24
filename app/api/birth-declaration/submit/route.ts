import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Générer un numéro de suivi unique
    const trackingNumber = uuidv4().substring(0, 8).toUpperCase();
    
    // Créer le dossier pour stocker les fichiers si nécessaire
    const uploadDir = join(process.cwd(), 'public', 'uploads', trackingNumber);
    await writeFile(join(uploadDir, '.gitkeep'), '');

    // Sauvegarder les fichiers
    const files = ['parentId', 'birthCertificate', 'familyBook'];
    for (const fileField of files) {
      const file = formData.get(fileField) as File;
      if (file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(join(uploadDir, file.name), buffer);
      }
    }

    // Sauvegarder les informations dans la base de données
    const declarationData = {
      trackingNumber,
      childName: formData.get('childName'),
      birthDate: formData.get('birthDate'),
      birthTime: formData.get('birthTime'),
      birthPlace: formData.get('birthPlace'),
      gender: formData.get('gender'),
      fatherName: formData.get('fatherName'),
      motherName: formData.get('motherName'),
      email: formData.get('email'),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    // TODO: Sauvegarder dans la base de données
    // await prisma.birthDeclaration.create({ data: declarationData });

    return NextResponse.json({ trackingNumber });
  } catch (error) {
    console.error('Erreur lors de la soumission:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la soumission de la déclaration' },
      { status: 500 }
    );
  }
} 
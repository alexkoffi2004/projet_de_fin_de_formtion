import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'agent') {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const requestId = params.id;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Aucun fichier reçu.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = (await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `acte_naissance/${requestId}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Cloudinary upload result is undefined'));
          }
        }
      ).end(buffer);
    })) as UploadApiResponse;

    const fileUrl = uploadResult.secure_url;
    const fileType = uploadResult.resource_type; // or infer from file.type if needed

    // Update the BirthCertificate document with the new file
    const updatedRequest = await prisma.birthCertificate.update({
      where: { id: requestId },
      data: {
        files: {
          push: {
            id: uploadResult.public_id,
            type: 'acte_naissance_final',
            url: fileUrl,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Document final téléversé avec succès.',
      data: updatedRequest,
    });
  } catch (error) {
    console.error('Error uploading final document:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors du téléversement du document final.' },
      { status: 500 }
    );
  }
} 
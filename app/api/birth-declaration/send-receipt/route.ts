import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

// Configuration de l'expéditeur d'email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { trackingNumber, email } = await request.json();

    // TODO: Récupérer les informations de la déclaration depuis la base de données
    // const declaration = await prisma.birthDeclaration.findUnique({
    //   where: { trackingNumber }
    // });

    // Simuler les données pour le test
    const declaration = {
      trackingNumber,
      childName: 'Test Child',
      birthDate: '2024-03-20',
      birthTime: '10:00',
      birthPlace: 'Test Hospital',
      gender: 'male',
      fatherName: 'Test Father',
      motherName: 'Test Mother',
      email: 'test@example.com',
      status: 'PAID',
      paymentMethod: 'orange',
      paymentTransactionId: 'ORANGE-123456',
      paidAt: new Date().toISOString()
    };

    // Générer le PDF
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    // En-tête
    doc.fontSize(20).text('Reçu de Déclaration de Naissance', { align: 'center' });
    doc.moveDown();

    // Informations de la déclaration
    doc.fontSize(12);
    doc.text(`Numéro de suivi: ${declaration.trackingNumber}`);
    doc.text(`Date de paiement: ${new Date(declaration.paidAt).toLocaleDateString()}`);
    doc.text(`Moyen de paiement: ${declaration.paymentMethod.toUpperCase()}`);
    doc.text(`Transaction ID: ${declaration.paymentTransactionId}`);
    doc.moveDown();

    // Informations de l'enfant
    doc.fontSize(14).text('Informations de l\'enfant');
    doc.fontSize(12);
    doc.text(`Nom: ${declaration.childName}`);
    doc.text(`Date de naissance: ${declaration.birthDate}`);
    doc.text(`Heure de naissance: ${declaration.birthTime}`);
    doc.text(`Lieu de naissance: ${declaration.birthPlace}`);
    doc.text(`Sexe: ${declaration.gender === 'male' ? 'Masculin' : 'Féminin'}`);
    doc.moveDown();

    // Informations des parents
    doc.fontSize(14).text('Informations des parents');
    doc.fontSize(12);
    doc.text(`Nom du père: ${declaration.fatherName}`);
    doc.text(`Nom de la mère: ${declaration.motherName}`);
    doc.moveDown();

    // Pied de page
    doc.fontSize(10);
    doc.text('Ce document est un reçu officiel de déclaration de naissance.', { align: 'center' });
    doc.text('Veuillez le conserver précieusement.', { align: 'center' });

    // Finaliser le PDF
    doc.end();

    // Attendre que le PDF soit généré
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    // Envoyer l'email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reçu de Déclaration de Naissance',
      text: `Bonjour,\n\nVeuillez trouver ci-joint le reçu de votre déclaration de naissance.\n\nNuméro de suivi: ${trackingNumber}\n\nCordialement,\nL'équipe administrative`,
      attachments: [
        {
          filename: `recu-declaration-${trackingNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du reçu:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du reçu' },
      { status: 500 }
    );
  }
} 
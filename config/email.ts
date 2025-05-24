import nodemailer from 'nodemailer';

export const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  from: process.env.SMTP_FROM,
};

export const transporter = nodemailer.createTransport(emailConfig);

export const emailTemplates = {
  receipt: (trackingNumber: string) => ({
    subject: 'Reçu de Déclaration de Naissance',
    text: `Bonjour,\n\nVeuillez trouver ci-joint le reçu de votre déclaration de naissance.\n\nNuméro de suivi: ${trackingNumber}\n\nCordialement,\nL'équipe administrative`,
  }),
  statusUpdate: (trackingNumber: string, status: string) => ({
    subject: 'Mise à jour de votre déclaration de naissance',
    text: `Bonjour,\n\nVotre déclaration de naissance (${trackingNumber}) a été mise à jour.\n\nNouveau statut: ${status}\n\nCordialement,\nL'équipe administrative`,
  }),
}; 
"use client";

import React, { useState } from 'react';
import { Steps, Button, Form, Input, DatePicker, Select, Upload, message, Card, Typography, Space } from 'antd';
import { UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { CitizenLayout } from '@/components/layouts/citizen-layout';
import { jsPDF } from 'jspdf';
import { useRouter } from 'next/navigation';

const { Step } = Steps;
const { Option } = Select;
const { Title, Text } = Typography;

interface BirthDeclarationForm {
  childName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  gender: string;
  fatherName: string;
  motherName: string;
  parentId: File;
  birthCertificate: File;
  familyBook?: File;
  email: string;
  trackingNumber: string;
  paymentMethod: string;
}

const BirthDeclaration: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const router = useRouter();

  const handlePayment = async () => {
    try {
      setLoading(true);
      const formData = await form.validateFields();
      // TODO: Implémenter l'appel API pour soumettre la déclaration
      const result = { trackingNumber: 'TEST123' }; // Simulation
      setTrackingNumber(result.trackingNumber);
      form.setFieldValue('trackingNumber', result.trackingNumber);
      
      // TODO: Implémenter l'appel API pour le paiement
      const paymentResult = { success: true }; // Simulation

      if (paymentResult.success) {
        setCurrentStep(2);
        message.success('Paiement effectué avec succès!');
      }
    } catch (error) {
      message.error('Erreur lors du traitement du paiement');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    try {
      const formValues = form.getFieldsValue();
      console.log('Form values:', formValues); // Debug log

      const doc = new jsPDF();
      
      // Couleurs du site
      const primaryColor = [255, 102, 0]; // Orange
      const secondaryColor = [255, 153, 0]; // Orange clair
      
      // En-tête avec logo et titre
      doc.setTextColor(...primaryColor);
      doc.setFontSize(20);
      doc.text('REPUBLIQUE DE COTE D\'IVOIRE', 105, 20, { align: 'center' });
      doc.setFontSize(16);
      doc.text('MINISTERE DE L\'INTERIEUR', 105, 30, { align: 'center' });
      doc.setFontSize(14);
      doc.text('Reçu de Déclaration de Naissance', 105, 40, { align: 'center' });
      
      // Ligne de séparation
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(20, 45, 190, 45);
      
      // Informations de base
      doc.setTextColor(0, 0, 0); // Noir pour le texte normal
      doc.setFontSize(12);
      doc.text(`Numéro de suivi: ${formValues.trackingNumber || 'En attente'}`, 20, 55);
      doc.text(`Date de la demande: ${new Date().toLocaleDateString()}`, 20, 65);
      
      // Informations de l'enfant
      doc.setTextColor(...primaryColor);
      doc.setFontSize(14);
      doc.text('INFORMATIONS DE L\'ENFANT', 20, 80);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(`Nom complet: ${formValues.childName || 'Non spécifié'}`, 30, 90);
      doc.text(`Date de naissance: ${formValues.birthDate ? new Date(formValues.birthDate).toLocaleDateString() : 'Non spécifiée'}`, 30, 100);
      doc.text(`Heure de naissance: ${formValues.birthTime || 'Non spécifiée'}`, 30, 110);
      doc.text(`Lieu de naissance: ${formValues.birthPlace || 'Non spécifié'}`, 30, 120);
      doc.text(`Genre: ${formValues.gender === 'MALE' ? 'Masculin' : formValues.gender === 'FEMALE' ? 'Féminin' : 'Non spécifié'}`, 30, 130);
      
      // Informations des parents
      doc.setTextColor(...primaryColor);
      doc.setFontSize(14);
      doc.text('INFORMATIONS DES PARENTS', 20, 150);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(`Nom du père: ${formValues.fatherName || 'Non spécifié'}`, 30, 160);
      doc.text(`Nom de la mère: ${formValues.motherName || 'Non spécifié'}`, 30, 170);
      
      // Paiement
      doc.setTextColor(...primaryColor);
      doc.setFontSize(14);
      doc.text('DÉTAILS DU PAIEMENT', 20, 190);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(`Montant: 1000 FCFA`, 30, 200);
      doc.text(`Méthode: ${formValues.paymentMethod || 'Non spécifiée'}`, 30, 210);
      doc.text(`Statut: Payé`, 30, 220);
      
      // Pied de page
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(10);
      doc.text('Ce document est un reçu officiel de déclaration de naissance.', 105, 250, { align: 'center' });
      doc.text('Conservez-le précieusement pour le suivi de votre demande.', 105, 260, { align: 'center' });
      
      // Signature
      doc.setTextColor(...primaryColor);
      doc.setFontSize(12);
      doc.text('Signature de l\'agent', 150, 280);
      doc.setDrawColor(...primaryColor);
      doc.line(150, 285, 190, 285);
      
      doc.save('recu_declaration_naissance.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Erreur lors de la génération du reçu');
    }
  };

  const sendEmailReceipt = async () => {
    try {
      setLoading(true);
      const email = form.getFieldValue('email');
      // TODO: Implémenter l'envoi du reçu par email
      message.success('Le reçu a été envoyé à votre adresse email');
    } catch (error) {
      message.error('Erreur lors de l\'envoi du reçu par email');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const formValues = form.getFieldsValue();
      
      // Appel à l'API pour soumettre la demande
      const response = await fetch('/api/birth-declaration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues),
      });

      const data = await response.json();

      if (data.success) {
        message.success('Votre demande a été soumise avec succès !');
        // Redirection vers la page de suivi des demandes
        router.push('/citizen/requests');
      } else {
        message.error(data.message || 'Erreur lors de la soumission de la demande');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      message.error('Erreur lors de la soumission de la demande');
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    });
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    {
      title: 'Documents et informations',
      content: (
        <Card>
          <Title level={4}>Étape 1: Documents et informations nécessaires</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
            Veuillez remplir tous les champs obligatoires et joindre les documents requis pour votre déclaration de naissance.
          </Text>
          <Form form={form} layout="vertical">
            <Form.Item
              name="childName"
              label="Nom complet de l'enfant"
              rules={[{ required: true, message: 'Veuillez entrer le nom de l\'enfant' }]}
              tooltip="Entrez le nom complet de l'enfant tel qu'il apparaîtra sur l'acte de naissance"
            >
              <Input placeholder="Ex: Kouadio Jean Pierre" />
            </Form.Item>

            <Form.Item
              name="birthDate"
              label="Date de naissance"
              rules={[{ required: true, message: 'Veuillez sélectionner la date de naissance' }]}
              tooltip="Sélectionnez la date exacte de naissance de l'enfant"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="birthTime"
              label="Heure de naissance"
              rules={[{ required: true, message: 'Veuillez entrer l\'heure de naissance' }]}
              tooltip="Entrez l'heure exacte de naissance de l'enfant"
            >
              <Input type="time" />
            </Form.Item>

            <Form.Item
              name="birthPlace"
              label="Lieu de naissance"
              rules={[{ required: true, message: 'Veuillez entrer le lieu de naissance' }]}
              tooltip="Entrez le nom de l'hôpital ou de la maternité où l'enfant est né"
            >
              <Input placeholder="Ex: Hôpital Général d'Abidjan" />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Sexe de l'enfant"
              rules={[{ required: true, message: 'Veuillez sélectionner le sexe' }]}
              tooltip="Sélectionnez le sexe de l'enfant"
            >
              <Select>
                <Option value="male">Masculin</Option>
                <Option value="female">Féminin</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="fatherName"
              label="Nom complet du père"
              rules={[{ required: true, message: 'Veuillez entrer le nom du père' }]}
              tooltip="Entrez le nom complet du père tel qu'il apparaît sur sa pièce d'identité"
            >
              <Input placeholder="Ex: Kouadio Jean" />
            </Form.Item>

            <Form.Item
              name="motherName"
              label="Nom complet de la mère"
              rules={[{ required: true, message: 'Veuillez entrer le nom de la mère' }]}
              tooltip="Entrez le nom complet de la mère tel qu'il apparaît sur sa pièce d'identité"
            >
              <Input placeholder="Ex: Aya Marie" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Veuillez entrer votre email' },
                { type: 'email', message: 'Veuillez entrer un email valide' }
              ]}
              tooltip="Entrez votre adresse email pour recevoir les notifications et le reçu"
            >
              <Input placeholder="exemple@gmail.com" />
            </Form.Item>

            <Form.Item
              name="parentId"
              label="CNI ou pièce d'identité des parents"
              rules={[{ required: true, message: 'Veuillez télécharger la pièce d\'identité' }]}
              tooltip="Téléchargez une copie de la CNI ou de la pièce d'identité des parents"
              extra="Formats acceptés: PDF, JPG, PNG. Taille maximale: 5MB"
            >
              <Upload
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={5 * 1024 * 1024}
                beforeUpload={(file) => {
                  const isLt5M = file.size / 1024 / 1024 < 5;
                  if (!isLt5M) {
                    message.error('Le fichier doit faire moins de 5MB!');
                  }
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>Télécharger</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="birthCertificate"
              label="Certificat de naissance"
              rules={[{ required: true, message: 'Veuillez télécharger le certificat de naissance' }]}
              tooltip="Téléchargez le certificat de naissance délivré par la maternité ou l'hôpital"
              extra="Formats acceptés: PDF, JPG, PNG. Taille maximale: 5MB"
            >
              <Upload
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={5 * 1024 * 1024}
                beforeUpload={(file) => {
                  const isLt5M = file.size / 1024 / 1024 < 5;
                  if (!isLt5M) {
                    message.error('Le fichier doit faire moins de 5MB!');
                  }
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>Télécharger</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="familyBook"
              label="Livret de famille (optionnel)"
              tooltip="Si vous possédez un livret de famille, vous pouvez le télécharger ici"
              extra="Formats acceptés: PDF, JPG, PNG. Taille maximale: 5MB"
            >
              <Upload
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={5 * 1024 * 1024}
                beforeUpload={(file) => {
                  const isLt5M = file.size / 1024 / 1024 < 5;
                  if (!isLt5M) {
                    message.error('Le fichier doit faire moins de 5MB!');
                  }
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>Télécharger</Button>
              </Upload>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      title: 'Paiement',
      content: (
        <Card>
          <Title level={4}>Étape 2: Paiement</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
            Veuillez sélectionner votre moyen de paiement préféré pour finaliser votre déclaration.
          </Text>
          <div>
            <h3>Montant à payer: 1000 FCFA</h3>
            <Form layout="vertical">
              <Form.Item
                label="Moyen de paiement"
                rules={[{ required: true, message: 'Veuillez sélectionner un moyen de paiement' }]}
                tooltip="Sélectionnez votre moyen de paiement mobile préféré"
              >
                <Select onChange={(value) => setPaymentMethod(value)}>
                  <Option value="orange">Orange Money</Option>
                  <Option value="mtn">MTN Mobile Money</Option>
                  <Option value="moov">Moov Money</Option>
                  <Option value="wave">Wave</Option>
                </Select>
              </Form.Item>
              <Button type="primary" onClick={handlePayment} loading={loading}>
                Procéder au paiement
              </Button>
            </Form>
          </div>
        </Card>
      ),
    },
    {
      title: 'Confirmation',
      content: (
        <Card>
          <Title level={4}>Étape 3: Confirmation</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
            Votre déclaration de naissance a été enregistrée avec succès!
          </Text>
          <div>
            <p>Numéro de suivi: <strong>{trackingNumber}</strong></p>
            <p>Conservez précieusement ce numéro pour suivre l'état de votre demande.</p>
            <div style={{ marginTop: '24px' }}>
              <Button type="primary" onClick={downloadReceipt} loading={loading} style={{ marginRight: '16px' }}>
                Télécharger le reçu
              </Button>
              <Button onClick={sendEmailReceipt} loading={loading} style={{ marginRight: '16px' }}>
                Recevoir par email
              </Button>
              <Button 
                type="primary" 
                onClick={handleConfirm}
                loading={loading}
              >
                Confirmer et soumettre la demande
              </Button>
            </div>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Steps current={currentStep} style={{ marginBottom: '32px' }}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div style={{ marginTop: '24px' }}>{steps[currentStep].content}</div>
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
        {currentStep > 0 && (
          <Button onClick={prev}>
            Précédent
          </Button>
        )}
        {currentStep < steps.length - 1 && currentStep !== 1 && (
          <Button type="primary" onClick={next}>
            Suivant
          </Button>
        )}
      </div>
    </div>
  );
};

export default BirthDeclaration; 
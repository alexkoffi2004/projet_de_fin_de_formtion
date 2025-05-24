import React, { useState } from 'react';
import { Steps, Button, Form, Input, DatePicker, Select, Upload, message, Card, Typography } from 'antd';
import { UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import BirthDeclarationService from './BirthDeclarationService';

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
}

const BirthDeclaration: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const birthDeclarationService = BirthDeclarationService.getInstance();

  const handlePayment = async () => {
    try {
      setLoading(true);
      const formData = await form.validateFields();
      const result = await birthDeclarationService.submitDeclaration(formData);
      setTrackingNumber(result.trackingNumber);
      
      const paymentResult = await birthDeclarationService.processPayment(
        result.trackingNumber,
        paymentMethod
      );

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
      setLoading(true);
      const blob = await birthDeclarationService.downloadReceipt(trackingNumber);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu-declaration-${trackingNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('Téléchargement du reçu réussi');
    } catch (error) {
      message.error('Erreur lors du téléchargement du reçu');
    } finally {
      setLoading(false);
    }
  };

  const sendEmailReceipt = async () => {
    try {
      setLoading(true);
      const email = form.getFieldValue('email');
      await birthDeclarationService.sendEmailReceipt(trackingNumber, email);
      message.success('Le reçu a été envoyé à votre adresse email');
    } catch (error) {
      message.error('Erreur lors de l\'envoi du reçu par email');
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
              <Input placeholder="exemple@email.com" />
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
              <Button onClick={sendEmailReceipt} loading={loading}>
                Recevoir par email
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
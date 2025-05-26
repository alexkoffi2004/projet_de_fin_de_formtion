"use client";

import React, { useState } from 'react';
import { Steps, Button, Form, Input, DatePicker, Upload, message, Card, Typography, Space, Alert } from 'antd';
import type { StepsProps, FormInstance, UploadProps, UploadFile } from 'antd';
import { UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { jsPDF } from 'jspdf'; // Potentiellement utile plus tard pour le reçu
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs'; // Pour gérer les dates avec DatePicker
import FileUpload from '../FileUpload'; // Implied import for FileUpload component

const { Step } = Steps;
const { Title, Text } = Typography;

interface ActeNaissanceFormValues {
  fullName: string;
  birthDate: string | null;
  birthPlace: string;
  fatherFullName: string;
  motherFullName: string;
  acteNumber: string;
  existingActe: {
    fileList: UploadFile<any>[];
  } | null;
  demandeurIdProof: {
    fileList: UploadFile<any>[];
  } | null;
}

const ActeNaissanceForm: React.FC = () => {
  const [form] = Form.useForm<ActeNaissanceFormValues>();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ActeNaissanceFormValues>({
    fullName: '',
    birthDate: null,
    birthPlace: '',
    fatherFullName: '',
    motherFullName: '',
    acteNumber: '',
    existingActe: null,
    demandeurIdProof: null,
  });
  const router = useRouter();
  const { data: session, status } = useSession();

  // Ajouter un état pour suivre le statut des fichiers
  const [idProofStatus, setIdProofStatus] = useState<'uploading' | 'done' | 'error' | null>(null);

  // Rediriger si non authentifié
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      // Stocker l'URL actuelle pour rediriger après connexion si nécessaire
      // localStorage.setItem('redirectAfterLogin', window.location.pathname);
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleIdProofUploadSuccess = (fileData: any) => {
    console.log('Pièce d\'identité uploadée avec succès:', fileData);
    // Mettre à jour formData avec l'URL du fichier
    setFormData(prev => ({
      ...prev,
      demandeurIdProof: {
        fileList: [{
          name: fileData.fileName,
          status: 'done',
          url: fileData.fileUrl,
          response: { url: fileData.fileUrl }
        }]
      }
    }));
    setIdProofStatus('done');
  };

  const handleIdProofUploadError = (error: any) => {
    console.error('Erreur lors de l\'upload de la pièce d\'identité:', error);
    setIdProofStatus('error');
  };

  // Fonction pour mettre à jour les données du formulaire
  const updateFormData = (values: Partial<ActeNaissanceFormValues>) => {
    setFormData(prev => ({ ...prev, ...values }));
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);

      // Utiliser les données stockées dans l'état
      console.log('Form data from state:', formData);

      // Vérification détaillée de chaque champ requis
      const missingFields = [];
      if (!formData.fullName) missingFields.push('Nom complet');
      if (!formData.birthDate) missingFields.push('Date de naissance');
      if (!formData.birthPlace) missingFields.push('Lieu de naissance');
      
      // Vérifier l'URL de la pièce d'identité
      const idProofUrl = formData.demandeurIdProof?.fileList?.[0]?.response?.url || 
                        formData.demandeurIdProof?.fileList?.[0]?.url;
      if (!idProofUrl) {
        missingFields.push('Pièce d\'identité');
      }

      if (missingFields.length > 0) {
        throw new Error(`Champs manquants : ${missingFields.join(', ')}`);
      }

      // Préparer les données pour l'API
      const data = {
        fullName: formData.fullName,
        birthDate: formData.birthDate ? dayjs(formData.birthDate).toISOString() : null,
        birthPlace: formData.birthPlace,
        fatherFullName: formData.fatherFullName || null,
        motherFullName: formData.motherFullName || null,
        acteNumber: formData.acteNumber || null,
        demandeurIdProofUrl: idProofUrl,
        existingActeUrl: formData.existingActe?.fileList?.[0]?.response?.url || 
                        formData.existingActe?.fileList?.[0]?.url || null,
      };

      console.log('Données envoyées à l\'API:', data);

      // Appel à l'API
      const response = await fetch('/api/citizen/request/birth-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Réponse de l\'API:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Erreur lors de la soumission de la demande d\'acte de naissance');
      }

      if (responseData.success) {
        message.success('Votre demande d\'acte de naissance a été soumise avec succès !');
        router.push('/citizen/documents');
      } else {
        throw new Error(responseData.message || 'Erreur inattendue lors de la soumission');
      }

    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      message.error(error.message || 'Une erreur est survenue lors de la soumission de la demande');
    } finally {
      setLoading(false);
    }
  };

  const next = async () => {
    try {
      let fieldsToValidate: (keyof ActeNaissanceFormValues)[] = [];
      
      if (currentStep === 0) {
        fieldsToValidate = ['fullName', 'birthDate', 'birthPlace'];
      } else if (currentStep === 1) {
        fieldsToValidate = ['fatherFullName', 'motherFullName'];
      } else if (currentStep === 2) {
        // Vérification des documents
        if (idProofStatus !== 'done') {
          form.setFields([
            {
              name: 'demandeurIdProof',
              errors: ['Veuillez joindre une pièce d\'identité']
            }
          ]);
          return;
        }
      }

      // Valider les champs de l'étape actuelle
      const values = await form.validateFields(fieldsToValidate);
      updateFormData(values);
      
      // Passer à l'étape suivante
      setCurrentStep(currentStep + 1);
    } catch (error: any) {
      console.error('Validation error:', error);
      if (!error.errorFields || error.errorFields.length === 0) {
        message.error('Veuillez remplir correctement les champs de l\'étape actuelle.');
      }
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    {
      title: "Informations sur l'acte",
      content: (
        <>
          <Form.Item
            name="fullName"
            label="Nom complet de la personne concernée"
            rules={[{ required: true, message: 'Veuillez entrer le nom complet' }]}
          >
            <Input placeholder="Ex: Kouadio Jean Alex" />
          </Form.Item>

          <Form.Item
            name="birthDate"
            label="Date de naissance"
            rules={[{ required: true, message: 'Veuillez sélectionner la date' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="birthPlace"
            label="Lieu de naissance (commune ou ville)"
            rules={[{ required: true, message: 'Veuillez entrer le lieu de naissance' }]}
          >
            <Input placeholder="Ex: Abidjan" />
          </Form.Item>
        </>
      ),
    },
    {
      title: "Parents",
      content: (
        <>
          <Text type="secondary">Veuillez renseigner au moins le nom complet du père ou de la mère.</Text>
          <Form.Item
            name="fatherFullName"
            label="Nom complet du père (optionnel)"
            rules={[{ required: false }]} // La validation logique est dans next()
          >
            <Input placeholder="Ex: Kouadio Pierre" />
          </Form.Item>

          <Form.Item
            name="motherFullName"
            label="Nom complet de la mère (optionnel)"
            rules={[{ required: false }]} // La validation logique est dans next()
          >
            <Input placeholder="Ex: Kone Marie" />
          </Form.Item>
        </>
      ),
    },
    {
      title: "Documents et numéro d'acte",
      content: (
        <>
          <Text type="secondary">Veuillez renseigner le numéro de l'acte OU télécharger un extrait existant.</Text>
          <Form.Item
            name="acteNumber"
            label="Numéro de l'acte (si connu)"
            rules={[{ required: false }]}
          >
            <Input placeholder="Ex: 123456" />
          </Form.Item>

          <Form.Item
            name="existingActe"
            label="Ou télécharger un extrait existant (optionnel)"
            rules={[{ required: false }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <FileUpload
              documentType="existing_acte"
              maxCount={1}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </Form.Item>

          <Text type="secondary" className="mt-4 block">
            <InfoCircleOutlined /> Une pièce d'identité du demandeur est requise.
          </Text>
          <Form.Item
            name="demandeurIdProof"
            label="Pièce d'identité du demandeur"
            rules={[{ required: true, message: 'Veuillez joindre une pièce d\'identité' }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <FileUpload
              documentType="id_proof"
              maxCount={1}
              accept=".pdf,.jpg,.jpeg,.png"
              onUploadSuccess={handleIdProofUploadSuccess}
              onUploadError={handleIdProofUploadError}
            />
          </Form.Item>
        </>
      ),
    },
     {
      title: "Paiement",
      content: (
        <>
          <Title level={4}>Paiement des frais</Title>
          <Text>Les frais pour deux copies d'acte de naissance s'élèvent à 2000 CFA.</Text>
          <Text className="block mt-2">Vous pouvez payer via :</Text>
          <ul>
            <li>Orange Money</li>
            <li>MTN Mobile Money</li>
            <li>Moov Money</li>
            <li>Wave</li>
          </ul>
          <Alert
            message="Étape de paiement en cours d'implémentation"
            description="L'intégration des moyens de paiement électronique sera bientôt disponible. Pour l'instant, veuillez soumettre votre demande et vous serez contacté pour les modalités de paiement."
            type="info"
            showIcon
            className="mt-4"
          />
          {/* TODO: Ajouter le bouton de paiement réel ici */}
        </>
      ),
    },
    {
      title: "Confirmation",
      content: (
        <>
          <Title level={4}>Résumé de la demande</Title>
          <Form.Item label="Nom complet de la personne concernée">
            <Text>{formData.fullName || 'Non renseigné'}</Text>
          </Form.Item>
          <Form.Item label="Date de naissance">
            <Text>{formData.birthDate ? dayjs(formData.birthDate).format('DD/MM/YYYY') : 'Non renseigné'}</Text>
          </Form.Item>
          <Form.Item label="Lieu de naissance">
            <Text>{formData.birthPlace || 'Non renseigné'}</Text>
          </Form.Item>
          <Form.Item label="Nom complet du père">
            <Text>{formData.fatherFullName || 'Non renseigné'}</Text>
          </Form.Item>
          <Form.Item label="Nom complet de la mère">
            <Text>{formData.motherFullName || 'Non renseigné'}</Text>
          </Form.Item>
          <Form.Item label="Numéro de l'acte (si connu)">
            <Text>{formData.acteNumber || 'Non renseigné'}</Text>
          </Form.Item>
          <Form.Item label="Extrait existant téléchargé">
            <Text>{formData.existingActe?.fileList?.[0]?.name || 'Non'}</Text>
          </Form.Item>
          <Form.Item label="Pièce d'identité du demandeur téléchargée">
            <Text>{idProofStatus === 'done' ? 'Oui' : 'Non'}</Text>
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <Title level={2}>Demande d'Acte de Naissance</Title>
        <Steps current={currentStep} className="mb-8">
          {steps.map(item => <Step key={item.title} title={item.title} />)}
        </Steps>

        <Form 
          form={form} 
          layout="vertical"
          preserve={true}
          initialValues={formData}
          onValuesChange={(changedValues) => {
            updateFormData(changedValues);
          }}
        >
          {/* Render current step content */}
          <div className="steps-content">{steps[currentStep].content}</div>

          <div className="steps-action mt-8">
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={next} loading={loading}>
                Suivant
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" onClick={handleConfirm} loading={loading}>
                Confirmer la demande
              </Button>
            )}
            {currentStep > 0 && (
              <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                Précédent
              </Button>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ActeNaissanceForm; 
"use client";

import React, { useState } from 'react';
import { Steps, Button, Form, Input, DatePicker, Upload, message, Card, Typography, Space, Alert } from 'antd';
import type { StepsProps, FormInstance, UploadProps } from 'antd';
import { UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { jsPDF } from 'jspdf'; // Potentiellement utile plus tard pour le reçu
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs'; // Pour gérer les dates avec DatePicker

const { Step } = Steps;
const { Title, Text } = Typography;

interface ActeNaissanceFormValues {
  fullName: string;
  birthDate: string;
  birthPlace: string;
  fatherFullName?: string;
  motherFullName?: string;
  acteNumber?: string;
  existingActe?: any; // Pour le fichier téléchargé
  demandeurIdProof: any; // Pour la pièce d'identité du demandeur
}

const ActeNaissanceForm: React.FC = () => {
  const [form] = Form.useForm<ActeNaissanceFormValues>();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Rediriger si non authentifié
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      // Stocker l'URL actuelle pour rediriger après connexion si nécessaire
      // localStorage.setItem('redirectAfterLogin', window.location.pathname);
      router.push('/auth/login');
    }
  }, [status, router]);

  // Configuration de l'upload pour la pièce d'identité
  const idProofUploadProps: UploadProps = {
    name: 'file',
    action: '/api/citizen/document/upload', // Endpoint à créer ou modifier
    headers: { authorization: 'Bearer ' + session?.accessToken }, // Adapter selon votre auth
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} fichier téléchargé avec succès.`);
        form.setFieldsValue({ demandeurIdProof: info.file });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} échec du téléchargement du fichier.`);
      }
    },
    beforeUpload(file) {
        const isLt2M = file.size / 1024 / 1024 < 2; // Limite de 2MB
        if (!isLt2M) {
          message.error('Le fichier doit être inférieur à 2MB!');
        }
        return isLt2M;
      },
    maxCount: 1,
  };

   // Configuration de l'upload pour l'ancien acte (optionnel)
   const existingActeUploadProps: UploadProps = {
    name: 'file',
    action: '/api/citizen/document/upload', // Endpoint à créer ou modifier
    headers: { authorization: 'Bearer ' + session?.accessToken }, // Adapter selon votre auth
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} fichier téléchargé avec succès.`);
        form.setFieldsValue({ existingActe: info.file });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} échec du téléchargement du fichier.`);
      }
    },
    beforeUpload(file) {
        const isLt2M = file.size / 1024 / 1024 < 2; // Limite de 2MB
        if (!isLt2M) {
          message.error('Le fichier doit être inférieur à 2MB!');
        }
        return isLt2M;
      },
    maxCount: 1,
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);

      // Valider et récupérer les valeurs du formulaire
      const values = await form.validateFields();
      console.log('Form values before submission:', values);

      // Préparer les données pour l'API
      const data = {
        documentType: 'birth_certificate', // Type spécifique
        fullName: values.fullName,
        birthDate: values.birthDate ? dayjs(values.birthDate).toISOString() : null,
        birthPlace: values.birthPlace,
        fatherFullName: values.fatherFullName,
        motherFullName: values.motherFullName,
        acteNumber: values.acteNumber,
        // Les fichiers ont été gérés par l'endpoint d'upload séparément.
        // Nous envoyons ici les URLs obtenues après l'upload réussi.
        demandeurIdProofUrl: values.demandeurIdProof?.response?.url || values.demandeurIdProof?.url,
        existingActeUrl: values.existingActe?.response?.url || values.existingActe?.url || null,
        // Vous pourriez ajouter ici d'autres champs communs comme reason ou urgency si votre formulaire les inclut
        // reason: form.getFieldValue('reason'), // Exemple si vous ajoutez ces champs au formulaire
        // urgency: form.getFieldValue('urgency'), // Exemple
      };

      console.log('Data being sent to API:', data);

      // Appel au NOUVEL endpoint API spécifique pour la demande d'acte de naissance
      const response = await fetch('/api/citizen/request/birth-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (!response.ok) {
        // Utiliser le message d'erreur de l'API si disponible
        throw new Error(responseData.error || 'Erreur lors de la soumission de la demande d\'acte de naissance');
      }

      // Le nouvel endpoint renvoie { message, requestId }
      if (responseData.requestId) { // Vérifier si l'ID de la demande a été retourné
        message.success('Votre demande d\'acte de naissance a été soumise avec succès !');
        
        // TODO: Intégrer l'étape de paiement en utilisant responseData.requestId
        // Pour l'instant, redirigeons vers les demandes
        router.push('/citizen/documents'); 

      } else {
        // Gérer les cas où l'API réussit mais ne renvoie pas l'ID attendu
        throw new Error(responseData.message || 'Erreur inattendue lors de la soumission (pas d\'ID de demande)');
      }

    } catch (error: any) { // Caster en any pour accéder à message
      console.error('Error submitting request:', error);
      message.error(error.message || 'Une erreur est survenue lors de la soumission de la demande');
    } finally {
      setLoading(false);
    }
  };

  const next = async () => {
    try {
      // Valider uniquement les champs de l'étape courante
      let fieldsToValidate: (keyof ActeNaissanceFormValues)[];
      if (currentStep === 0) {
        fieldsToValidate = ['fullName', 'birthDate', 'birthPlace'];
      } else if (currentStep === 1) {
        // Au moins un des deux parents doit être renseigné
         const { fatherFullName, motherFullName } = form.getFieldsValue();
         if (!fatherFullName && !motherFullName) {
             form.setFields({
                 fatherFullName: { errors: [new Error('Veuillez entrer le nom du père ou de la mère')] },
                 motherFullName: { errors: [new Error('Veuillez entrer le nom du père ou de la mère')] },
             });
             return;
         }
         fieldsToValidate = ['fatherFullName', 'motherFullName']; // La validation logique est ci-dessus

      } else if (currentStep === 2) {
        // Numéro d'acte OU fichier existant
        const { acteNumber, existingActe } = form.getFieldsValue();
        if (!acteNumber && (!existingActe || existingActe.fileList.length === 0 || existingActe.file.status !== 'done')) {
            form.setFields({
                acteNumber: { errors: [new Error('Veuillez entrer le numéro de l\'acte OU télécharger un extrait existant')] },
                existingActe: { errors: [new Error('Veuillez entrer le numéro de l\'acte OU télécharger un extrait existant')] },
            });
            return;
        }
        // Pièce d'identité est requise
        const { demandeurIdProof } = form.getFieldsValue();
         if (!demandeurIdProof || demandeurIdProof.fileList.length === 0 || demandeurIdProof.file.status !== 'done') {
            form.setFields({
                demandeurIdProof: { errors: [new Error('Veuillez joindre une pièce d\'identité')] },
            });
            return;
         }
        fieldsToValidate = ['acteNumber', 'existingActe', 'demandeurIdProof']; // La validation logique est ci-dessus
      }
       else {
           fieldsToValidate = []; // Confirmation step
       }

      // Exclure les champs vides de la validation si ce ne sont pas des champs requis de l'étape
      const valuesToValidate = form.getFieldsValue(fieldsToValidate);
      await form.validateFields(Object.keys(valuesToValidate));

      const currentValues = form.getFieldsValue();
      console.log('Current step values:', currentValues);

      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Validation error:', error);
      // Ant Design message.error affichera déjà le message par défaut des règles
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
            rules={[{ required: false }]} // La validation logique est dans next()
          >
            <Input placeholder="Ex: 123456" />
          </Form.Item>

          <Form.Item
            name="existingActe"
            label="Ou télécharger un extrait existant (optionnel)"
             rules={[{ required: false }]} // La validation logique est dans next()
          >
             <Upload {...existingActeUploadProps}>
                <Button icon={<UploadOutlined />}>Sélectionner le fichier</Button>
             </Upload>
          </Form.Item>

           <Text type="secondary" className="mt-4 block"><InfoCircleOutlined /> Une pièce d'identité du demandeur est requise.</Text>
           <Form.Item
            name="demandeurIdProof"
            label="Pièce d'identité du demandeur"
            rules={[{ required: true, message: 'Veuillez joindre une pièce d\'identité' }]}
            valuePropName="fileList" // Pour que Form.Item gère l'objet fileList d'Upload
            getValueFromEvent={(e) => {
                if (Array.isArray(e)) {
                  return e;
                }
                return e?.fileList;
              }}
          >
             <Upload {...idProofUploadProps}>
                <Button icon={<UploadOutlined />}>Télécharger la pièce d'identité</Button>
             </Upload>
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
            <Text>{form.getFieldValue('fullName')}</Text>
          </Form.Item>
          <Form.Item label="Date de naissance">
            <Text>{form.getFieldValue('birthDate') ? dayjs(form.getFieldValue('birthDate')).format('DD/MM/YYYY') : ''}</Text>
          </Form.Item>
          <Form.Item label="Lieu de naissance">
            <Text>{form.getFieldValue('birthPlace')}</Text>
          </Form.Item>
           <Form.Item label="Nom complet du père">
            <Text>{form.getFieldValue('fatherFullName') || 'Non renseigné'}</Text>
          </Form.Item>
           <Form.Item label="Nom complet de la mère">
            <Text>{form.getFieldValue('motherFullName') || 'Non renseigné'}</Text>
          </Form.Item>
          <Form.Item label="Numéro de l'acte (si connu)">
            <Text>{form.getFieldValue('acteNumber') || 'Non renseigné'}</Text>
          </Form.Item>
           <Form.Item label="Extrait existant téléchargé">
            <Text>{form.getFieldValue('existingActe') ? form.getFieldValue('existingActe').file?.name || 'Oui' : 'Non'}</Text>
          </Form.Item>
           <Form.Item label="Pièce d'identité du demandeur téléchargée">
            <Text>{form.getFieldValue('demandeurIdProof') ? form.getFieldValue('demandeurIdProof').file?.name || 'Oui' : 'Non'}</Text>
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
          initialValues={{
            childFirstName: '', // Ces champs ne sont plus pertinents pour l'acte de naissance
            childLastName: '',
            childGender: undefined,
            birthDate: null,
            birthPlace: '',
            fatherFirstName: '',
            fatherLastName: '',
            motherFirstName: '',
            motherLastName: '',
            documents: [],
             // Champs spécifiques à l'acte de naissance
            fullName: '',
            fatherFullName: '',
            motherFullName: '',
            acteNumber: '',
            existingActe: undefined,
            demandeurIdProof: undefined,
          }}
        >
          {/* Render current step content */}
          <div className="steps-content">{steps[currentStep].content}</div>

          <div className="steps-action mt-8">
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={() => next()} loading={loading}>
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
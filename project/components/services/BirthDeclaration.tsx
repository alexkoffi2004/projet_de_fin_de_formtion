"use client";

import React, { useState } from 'react';
import { Steps, Button, Form, Input, DatePicker, Select, Upload, message, Card, Typography, Space } from 'antd';
import type { StepsProps, FormInstance, UploadProps } from 'antd';
import { UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { CitizenLayout } from '@/components/layouts/citizen-layout';
import { jsPDF } from 'jspdf';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const { Step } = Steps;
const { Option } = Select;
const { Title, Text } = Typography;

interface BirthDeclarationForm {
  childFirstName: string;
  childLastName: string;
  childGender: string;
  birthDate: string;
  birthPlace: string;
  fatherFirstName: string;
  fatherLastName: string;
  motherFirstName: string;
  motherLastName: string;
  documents: {
    type: string;
    url: string;
  }[];
}

const BirthDeclaration: React.FC = () => {
  const [form] = Form.useForm<BirthDeclarationForm>();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Rediriger si non authentifié
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      
      // Vérifier si l'utilisateur est connecté
      if (!session?.user) {
        message.error('Vous devez être connecté pour soumettre une déclaration');
        router.push('/auth/login');
        return;
      }

      // Valider et récupérer les valeurs du formulaire
      try {
        // Valider tous les champs
        const values = await form.validateFields();
        console.log('Form values before submission:', values);

        // Préparer les données dans le bon format
        const data = {
          childFirstName: values.childFirstName,
          childLastName: values.childLastName,
          childGender: values.childGender,
          birthDate: values.birthDate?.toISOString(),
          birthPlace: values.birthPlace,
          fatherFirstName: values.fatherFirstName,
          fatherLastName: values.fatherLastName,
          motherFirstName: values.motherFirstName,
          motherLastName: values.motherLastName,
          documents: values.documents?.map((file: any) => ({
            type: file.type || file.response?.type,
            url: file.url || file.response?.url
          })) || []
        };

        console.log('Data being sent:', data);
        
        // Appel à l'API pour soumettre la demande
        const response = await fetch('/api/birth-declaration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();
        console.log('API Response:', responseData);

        if (!response.ok) {
          throw new Error(responseData.error || 'Erreur lors de la soumission de la demande');
        }

        if (responseData.success) {
          message.success('Votre demande a été soumise avec succès !');
          router.push('/citizen/requests');
        } else {
          throw new Error(responseData.error || 'Erreur lors de la soumission de la demande');
        }
      } catch (validationError) {
        console.error('Validation error:', validationError);
        message.error('Veuillez remplir tous les champs requis');
        return;
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      message.error(error instanceof Error ? error.message : 'Erreur lors de la soumission de la demande');
    } finally {
      setLoading(false);
    }
  };

  const next = async () => {
    try {
      // Valider uniquement les champs de l'étape courante
      const fieldsToValidate = currentStep === 0 
        ? ['childFirstName', 'childLastName', 'childGender', 'birthDate', 'birthPlace']
        : currentStep === 1
        ? ['fatherFirstName', 'fatherLastName', 'motherFirstName', 'motherLastName']
        : ['documents'];

      await form.validateFields(fieldsToValidate);
      const currentValues = form.getFieldsValue();
      console.log('Current step values:', currentValues);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Validation error:', error);
      message.error('Veuillez remplir tous les champs requis');
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <CitizenLayout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <Title level={2}>Déclaration de Naissance</Title>
          <Steps current={currentStep} className="mb-8">
            <Step title="Informations de l'enfant" />
            <Step title="Informations des parents" />
            <Step title="Documents" />
            <Step title="Confirmation" />
          </Steps>

          <Form 
            form={form} 
            layout="vertical"
            preserve={true}
            initialValues={{
              childFirstName: '',
              childLastName: '',
              childGender: undefined,
              birthDate: null,
              birthPlace: '',
              fatherFirstName: '',
              fatherLastName: '',
              motherFirstName: '',
              motherLastName: '',
              documents: []
            }}
          >
            {currentStep === 0 && (
              <>
                <Form.Item
                  name="childFirstName"
                  label="Prénom de l'enfant"
                  rules={[{ required: true, message: 'Veuillez entrer le prénom de l\'enfant' }]}
                  validateTrigger={['onChange', 'onBlur', 'onSubmit']}
                >
                  <Input placeholder="Ex: Jean" />
                </Form.Item>

                <Form.Item
                  name="childLastName"
                  label="Nom de famille de l'enfant"
                  rules={[{ required: true, message: 'Veuillez entrer le nom de famille de l\'enfant' }]}
                  validateTrigger={['onChange', 'onBlur', 'onSubmit']}
                >
                  <Input placeholder="Ex: Pierre" />
                </Form.Item>

                <Form.Item
                  name="childGender"
                  label="Sexe de l'enfant"
                  rules={[{ required: true, message: 'Veuillez sélectionner le sexe' }]}
                  validateTrigger={['onChange', 'onBlur', 'onSubmit']}
                >
                  <Select placeholder="Sélectionnez le sexe">
                    <Option value="male">Masculin</Option>
                    <Option value="female">Féminin</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="birthDate"
                  label="Date de naissance"
                  rules={[{ required: true, message: 'Veuillez sélectionner la date de naissance' }]}
                  validateTrigger={['onChange', 'onBlur', 'onSubmit']}
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>

                <Form.Item
                  name="birthPlace"
                  label="Lieu de naissance"
                  rules={[{ required: true, message: 'Veuillez entrer le lieu de naissance' }]}
                  validateTrigger={['onChange', 'onBlur', 'onSubmit']}
                >
                  <Input placeholder="Ex: Hôpital Principal" />
                </Form.Item>
              </>
            )}

            {currentStep === 1 && (
              <>
                <Form.Item
                  name="fatherFirstName"
                  label="Prénom du père"
                  rules={[{ required: true, message: 'Veuillez entrer le prénom du père' }]}
                >
                  <Input placeholder="Ex: Jean" />
                </Form.Item>

                <Form.Item
                  name="fatherLastName"
                  label="Nom de famille du père"
                  rules={[{ required: true, message: 'Veuillez entrer le nom de famille du père' }]}
                >
                  <Input placeholder="Ex: Pierre" />
                </Form.Item>

                <Form.Item
                  name="motherFirstName"
                  label="Prénom de la mère"
                  rules={[{ required: true, message: 'Veuillez entrer le prénom de la mère' }]}
                >
                  <Input placeholder="Ex: Marie" />
                </Form.Item>

                <Form.Item
                  name="motherLastName"
                  label="Nom de famille de la mère"
                  rules={[{ required: true, message: 'Veuillez entrer le nom de famille de la mère' }]}
                >
                  <Input placeholder="Ex: Aya" />
                </Form.Item>
              </>
            )}

            {currentStep === 2 && (
              <Form.Item
                name="documents"
                label="Documents requis"
                rules={[{ required: true, message: 'Veuillez télécharger les documents requis' }]}
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) {
                    return e;
                  }
                  return e?.fileList;
                }}
              >
                <Upload
                  name="file"
                  action="/api/upload"
                  listType="text"
                  multiple
                  maxCount={5}
                  beforeUpload={(file) => {
                    const isLt5M = file.size / 1024 / 1024 < 5;
                    if (!isLt5M) {
                      message.error('Le fichier doit faire moins de 5MB!');
                    }
                    return isLt5M;
                  }}
                  onChange={({ fileList }) => {
                    console.log('Uploaded files:', fileList);
                  }}
                >
                  <Button icon={<UploadOutlined />}>Télécharger les documents</Button>
                </Upload>
              </Form.Item>
            )}

            {currentStep === 3 && (
              <div className="text-center">
                <Text>Veuillez vérifier toutes les informations avant de soumettre votre demande.</Text>
                <Button type="primary" onClick={handleConfirm} loading={loading} className="mt-4">
                  Confirmer et soumettre
                </Button>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {currentStep > 0 && (
                <Button onClick={prev}>
                  Précédent
                </Button>
              )}
              {currentStep < 3 && (
                <Button type="primary" onClick={next}>
                  Suivant
                </Button>
              )}
            </div>
          </Form>
        </Card>
      </div>
    </CitizenLayout>
  );
};

export default BirthDeclaration; 
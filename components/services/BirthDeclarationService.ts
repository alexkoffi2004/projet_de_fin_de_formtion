import axios from 'axios';

interface BirthDeclarationData {
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

class BirthDeclarationService {
  private static instance: BirthDeclarationService;
  private baseUrl: string = '/api/birth-declaration';

  private constructor() {}

  public static getInstance(): BirthDeclarationService {
    if (!BirthDeclarationService.instance) {
      BirthDeclarationService.instance = new BirthDeclarationService();
    }
    return BirthDeclarationService.instance;
  }

  async submitDeclaration(data: BirthDeclarationData): Promise<{ trackingNumber: string }> {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      });

      const response = await axios.post(`${this.baseUrl}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la soumission de la déclaration');
    }
  }

  async processPayment(trackingNumber: string, paymentMethod: string): Promise<{ success: boolean }> {
    try {
      const response = await axios.post(`${this.baseUrl}/payment`, {
        trackingNumber,
        paymentMethod,
        amount: 1000,
      });

      return response.data;
    } catch (error) {
      throw new Error('Erreur lors du traitement du paiement');
    }
  }

  async downloadReceipt(trackingNumber: string): Promise<Blob> {
    try {
      const response = await axios.get(`${this.baseUrl}/receipt/${trackingNumber}`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      throw new Error('Erreur lors du téléchargement du reçu');
    }
  }

  async sendEmailReceipt(trackingNumber: string, email: string): Promise<{ success: boolean }> {
    try {
      const response = await axios.post(`${this.baseUrl}/send-receipt`, {
        trackingNumber,
        email,
      });

      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de l\'envoi du reçu par email');
    }
  }

  async getDeclarationStatus(trackingNumber: string): Promise<{ status: string }> {
    try {
      const response = await axios.get(`${this.baseUrl}/status/${trackingNumber}`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération du statut de la déclaration');
    }
  }
}

export default BirthDeclarationService; 
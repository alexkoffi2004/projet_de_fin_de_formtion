import { ObjectId } from 'mongodb';
import { UserRole } from './user';

export interface Citizen {
  _id?: ObjectId;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  adresse: string;
  numeroTelephone: string;
  email: string;
  dateInscription: Date;
  statut: 'actif' | 'inactif';
  password: string;
  confirmPassword?: string;
  role: UserRole;
} 
import { LocationDetails } from './others.model';
import firebase from 'firebase/app';

export enum AssignedRoles {
  superAdmin = 'super-admin',
  admin = 'admin',
}
export type FirebaseUserCredential = firebase.auth.UserCredential;

export type FirebaseUser = firebase.User;
export interface Admin {
  name: string;
  email: string;
  contactNumber: number;
  location: LocationDetails;
  status: number;
  role: AssignedRoles;
  id?: string;
  managedBy?: string;
  altContactNumber?: number;
  gst?: number;
  selfGround?: boolean;
  website?: string;
  imgPathLogo?: string;
  company?: string;
}

export interface RegistrationRequest {
  name: string;
  email: string;
  contactNumber: number;
  location: LocationDetails;
  selfGround: boolean;
  company?: string;
  gst?: number;
}

export interface AdminConfigurationSeason {
  duration: number;
  lastParticipationDate: string;
};

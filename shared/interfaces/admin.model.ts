import { LocationDetails } from './others.model';
import firebase from 'firebase/app';

export enum AssignedRoles {
  superAdmin = 'super-admin',
  organizer = 'organizer',
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
  selfGround?: number;
  website?: string;
  imgPathLogo?: string;
  company?: string;
}

export interface AdminConfigurationSeason {
  duration: number;
  lastParticipationDate: string;
};

export interface ActionRequest {
  id: string;
  uid: string;
  timestamp: number;
  reason: string;
  referenceID: string;
}

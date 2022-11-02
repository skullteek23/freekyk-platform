import { LocationDetails } from './others.model';

export interface Admin {
  name: string;
  company: string;
  managedBy: string;
  email: string;
  contactNumber: number;
  altContactNumber: number;
  location: LocationDetails;
  gst: number;
  selfGround: boolean;
  website: string;
  imgPathLogo: string;
  status: number;
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


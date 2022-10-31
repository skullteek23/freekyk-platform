import { LocationDetails } from './others.model';

export class Admin {
  name = '';
  company: string = null;
  managedBy: string = null;
  email: string = null;
  contactNumber: number = null;
  altContactNumber: number = null;
  location: LocationDetails = new LocationDetails();
  gst: number = null;
  selfGround = false;
  website: string = null;
  imgPathLogo: string = null;
  status: number = null;
}

export class RegistrationRequest {
  name = '';
  email: string = null;
  contactNumber: number = null;
  location: LocationDetails = new LocationDetails();
  company: string = null;
  gst: number = null;
  selfGround = false;
}


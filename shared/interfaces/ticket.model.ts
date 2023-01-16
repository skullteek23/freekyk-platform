export enum TicketStatus {
  Open = 0,
  Pending = 1,
  Closed = 2
}
export enum TicketTypes {
  Support = 0, // generated by anybody from support page
  Season = 1, // generated for season related query by admins
  Profile = 2, // generated for profile-related query by users
}
export interface ISupportTicket {
  status: TicketStatus;
  type: TicketTypes;
  timestamp: number;
  uid: string;
  id?: string;
  response?: string;
  contactInfo?: IContactDetails;
  message?: string;
}

export interface IContactDetails {
  name: string;
  email: string;
  phone_no?: string;
}

export interface IFeedback {
  rating: number;
  message?: string;
  uid?: string
}

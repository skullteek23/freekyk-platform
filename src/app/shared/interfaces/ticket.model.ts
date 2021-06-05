import { Timestamp } from '@firebase/firestore-types';
export interface BasicTicket {
  ticket_UID: string;
  name: string;
  email: string;
  ph_number: string;
  query: string;
  tkt_date: Timestamp;
  tkt_status: 'Complete' | 'Processing' | 'Recieved';
  id?: string;
}

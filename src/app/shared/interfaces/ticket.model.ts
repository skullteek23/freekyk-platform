export interface BasicTicket {
  ticket_UID: string;
  name: string;
  email: string;
  ph_number: string;
  query: string;
  tkt_date: number;
  tkt_status: 'Complete' | 'Processing' | 'Recieved';
  id?: string;
}

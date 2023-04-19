
export interface ISlotOption {
  booked: boolean;
  name: string;
  selected: boolean;
  position: number;
  uid: string;
}
export interface IPickupGameSlot {
  orderID: string;
  seasonID: string;
  timestamp: number;
  uid: string;
  slots: number[];
  name?: string;
  id?: string;
}

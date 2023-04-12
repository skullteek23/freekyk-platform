
// export type TeamSelected = 'home' | 'away';

export interface IPickupGameSlot {
  orderID: string;
  seasonID: string;
  // teamSelected: TeamSelected;
  timestamp: number;
  uid: string;
  slots: number;
  name?: string;
  id?: string;
}

export interface GroundBasicInfo {
  name: string;
  imgpath: string;
  locCity: string;
  locState: string;
  fieldType: 'FG' | 'SG' | 'HG' | 'AG' | 'TURF';
  own_type: 'FK' | 'PUBLIC' | 'PRIVATE';
  playLvl: 'good' | 'best' | 'fair';
  id?: string;
}
export interface GroundMoreInfo {
  parking: boolean;
  mainten: boolean;
  goalp: boolean;
  opmTimeStart: number;
  opmTimeEnd: number;
  washroom: boolean;
  foodBev: boolean;
  avgRating: number;
}

export interface GroundPrivateInfo {
  name: string;
  locCity: string;
  locState: string;
  signedContractFileLink: string;
  contractStartDate: number;
  contractEndDate: number;
  timings: {};
  id?: string;
}

export interface GroundBookings {
  groundID: string;
  seasonID: string;
  bookingFrom: number;
  bookingTo: number;
}

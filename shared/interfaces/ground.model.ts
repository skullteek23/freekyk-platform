export type GROUND_TYPES = 'PUBLIC' | 'PRIVATE';

export interface GroundBasicInfo {
  name: string;
  imgpath: string;
  locCity: string;
  locState: string;
  fieldType: 'FG' | 'SG' | 'HG' | 'AG' | 'TURF';
  ownType: GROUND_TYPES;
  playLvl: 'good' | 'best' | 'fair';
  id?: string;
}
export interface GroundMoreInfo {
  referee: boolean;
  foodBev: boolean;
  parking: boolean;
  goalpost: boolean;
  washroom: boolean;
  staff: boolean;
  id?: string;
}

export interface GroundPrivateInfo {
  signedContractFileLink: string;
  contractStartDate: number;
  contractEndDate: number;
  timings: any;
  id?: string;
}

export interface GroundBooking {
  by: string;
  slotTimestamp: number;
  groundID: string;
}

export interface IGroundInfo {
  name: string;
  imgpath: string;
  locCity: string;
  locState: string;
  fieldType: 'FG' | 'SG' | 'HG' | 'AG' | 'TURF';
  ownType: GROUND_TYPES;
  playLvl: 'good' | 'best' | 'fair';
  id: string;
  referee: boolean;
  foodBev: boolean;
  parking: boolean;
  goalpost: boolean;
  washroom: boolean;
  staff: boolean;
  signedContractFileLink: string;
  contractStartDate: number;
  contractEndDate: number;
  timings: any;
}

export interface IGroundSelection {
  id: string,
  locCity: string;
  locState: string;
  name: string;
  ownType: GROUND_TYPES
  slots: number[]
}

// grounds/{{GROUND-ID}}
// groundContracts/{{GROUND-ID}}
// grounds/{{GROUND-ID}}/additionalInfo/moreInfo
// grounds/{{GROUND-ID}}/additionalInfo/moreInfo
// groundBookings/{{BOOKING-ID}}

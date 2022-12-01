import { MatchConstants } from '@shared/constants/constants';
import { LocationDetails } from './others.model';
import { ITiming } from '@shared/interfaces/others.model';

export type OWNERSHIP_TYPES = 'PUBLIC' | 'PRIVATE';
export type TURF_TYPES = 'FG' | 'SG' | 'HG' | 'AG' | 'TURF'

export interface GroundBasicInfo {
  name: string;
  locCity: string;
  locState: string;
  fieldType: TURF_TYPES;
  ownType: OWNERSHIP_TYPES;
  playLvl: 'good' | 'best' | 'fair';
  imgpath?: string;
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
  contractStartDate: number;
  contractEndDate: number;
  timings: any;
  signedContractFileLink?: string;
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
  fieldType: TURF_TYPES;
  ownType: OWNERSHIP_TYPES;
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
  ownType: OWNERSHIP_TYPES;
  slots: number[]
}

// grounds/{{GROUND-ID}}
// groundContracts/{{GROUND-ID}}
// grounds/{{GROUND-ID}}/additionalInfo/moreInfo
// grounds/{{GROUND-ID}}/additionalInfo/moreInfo
// groundBookings/{{BOOKING-ID}}

export const turfFormatter = {
  format: (val: TURF_TYPES) => {
    const turfTypes = {
      FG: 'Football Ground',
      SG: 'Soft Ground',
      HG: 'Hard Ground',
      AG: 'Artificial Ground',
      TURF: 'Turf',
    }
    return turfTypes[val] ? turfTypes[val] : MatchConstants.LABEL_NOT_AVAILABLE;
  }
}

export interface IGroundDetails {
  name: string;
  type: OWNERSHIP_TYPES;
  location: LocationDetails;
  contract: {
    start: string;
    end: string
  };
}

export type IGroundAvailability = ITiming[];

export interface IGroundSummaryData {
  name: string;
  type: OWNERSHIP_TYPES;
  location: string;
  timings: string;
  contractRange: string;
}

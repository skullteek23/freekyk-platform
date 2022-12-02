import { MatchConstants } from '@shared/constants/constants';
import { LocationDetails } from './others.model';
import { ITiming } from '@shared/interfaces/others.model';

export type OWNERSHIP_TYPES = 'PUBLIC' | 'PRIVATE';
export type TURF_TYPES = 'FG' | 'SG' | 'HG' | 'AG' | 'TURF'
export type PLAY_LEVELS = 'good' | 'best' | 'fair';
export const turfTypes = {
  FG: 'Full Ground',
  SG: 'Short Ground',
  HG: 'Huge Ground',
  AG: 'Agile Ground',
  TURF: 'Football Turf',
}
export const ownershipTypes = [
  'PUBLIC',
  'PRIVATE'
]
export const playLevels = [
  'fair',
  'good',
  'best',
];

export interface GroundBasicInfo {
  name: string;
  locCity: string;
  locState: string;
  fieldType: TURF_TYPES;
  ownType: OWNERSHIP_TYPES;
  playLvl: PLAY_LEVELS;
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
  playLvl: PLAY_LEVELS;
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

export const Formatters = {
  formatTurf: (val: TURF_TYPES) => {
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
  playLvl: PLAY_LEVELS;
  fieldType: TURF_TYPES;
  referee: boolean;
  foodBev: boolean;
  parking: boolean;
  goalpost: boolean;
  washroom: boolean;
  staff: boolean;
}

export type IGroundAvailability = ITiming[];

export interface IGroundSummaryData {
  name: string;
  type: OWNERSHIP_TYPES;
  location: string;
  timings: string;
  contractRange: string;
  playLvl: string;
  fieldType: string;
  referee: string;
  foodBev: string;
  parking: string;
  goalpost: string;
  washroom: string;
  staff: string;
}

export interface GroundTimings {
  0: number[];
  1: number[];
  2: number[];
  3: number[];
  4: number[];
  5: number[];
  6: number[];
}

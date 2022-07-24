import { Timestamp } from '@firebase/firestore-types';
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
  opmTimeStart: Timestamp;
  opmTimeEnd: Timestamp;
  washroom: boolean;
  foodBev: boolean;
  avgRating: number;
}

export interface GroundPrivateInfo {
  name: string;
  locCity: string;
  locState: string;
  signedContractFileLink: string;
  timings: {};
}

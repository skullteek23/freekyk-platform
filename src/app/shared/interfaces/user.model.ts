import { Timestamp } from '@firebase/firestore-types';
export interface PlayerBasicInfo {
  name: string;
  team: { name: string; id: string; capId: string };
  imgpath_sm?: string;
  jer_no?: number;
  locCity?: string;
  pl_pos?: string;
  gen?: 'M' | 'F';
  id?: string;
}
export interface PlayerMoreInfo {
  imgpath_lg?: string;
  profile: boolean;
  born?: Timestamp;
  locState?: string;
  locCountry?: string;
  nickname?: string;
  height?: number;
  weight?: number;
  str_ft?: 'L' | 'R';
  bio?: string;
  prof_teams?: string[];
  prof_tours?: string[];
}

export interface FsBasic {
  name: string;
  nickname: string;
  gen?: 'M' | 'F';
  imgpath_lg?: string;
  born?: Timestamp;
  locCountry?: string;
  bio?: string;
  ig?: string;
  id?: string;
}

export interface SocialMediaLinks {
  ig: string;
  yt: string;
  fb: string;
  tw: string;
}
export interface BasicStats {
  apps: number;
  g: number;
  w: number;
  cards: number;
  l: number;
}
export interface FsStats {
  sk_lvl: number;
  br_colb?: BrandCollabInfo[];
  top_vids?: string[];
  tr_a?: number;
  tr_w?: number;
  tr_u?: number;
}
export interface FsProfileVideos {
  top_vids: string[];
}
export interface FsJourney {
  approved_tricks: number[];
  unapproved_tricks: number[];
  waiting_tricks: number[];
}
export interface BrandCollabInfo {
  name: string;
  imgpathLogo: string;
}
export interface MembershipInfo {
  premium: boolean;
  validity: Date;
  paymentId: string;
}

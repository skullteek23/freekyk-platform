import { Timestamp } from '@firebase/firestore-types';
import { SocialMediaLinks } from './user.model';

export const NO_TEAM = 'NO_TEAM';
export const CAPTAIN_ONLY = 'CAPTAIN_ONLY';
export const MEMBER_ONLY = 'MEMBER_ONLY';
export const ALREADY_IN_TEAM = 'ALREADY_IN_TEAM';
export const INCOMPLETE_PROFILE = 'INCOMPLETE_PROFILE';
export const PHOTO_NOT_UPLOADED = 'PHOTO_NOT_UPLOADED';
export interface TeamBasicInfo {
  tname: string;
  isVerified: boolean;
  imgpath: string;
  imgpath_logo: string;
  captainId: string;
  locState?: string;
  locCity?: string;
  id?: string;
}
export interface TeamMoreInfo {
  tdateCreated: Timestamp;
  tageCat: 15 | 19 | 21 | 25 | 30;
  captainName: string;
  tslogan?: string;
  tdesc?: string;
  tSocials?: SocialMediaLinks | null;
}

export interface TeamStats {
  played: {
    fkc: number | string;
    fcp: string | number;
    fpl: string | number;
  };
  w: string | number;
  g: string | number;
  l: string | number;
  rcards: string | number;
  ycards: string | number;
  g_conceded: string | number;
  pr_tour_wins?: string | number;
}
export interface TeamMembers {
  memCount: number;
  members: Tmember[];
}
export interface Tmember {
  name: string;
  id: string;
  pl_pos?: string | null;
  imgpath_sm?: string | null;
}
export interface TeamMedia {
  media: string[];
}
export interface ActiveSquadMember {
  name: string;
  id: string;
  pl_pos: string;
  imgpath_sm: string;
  response: 'accept' | 'reject' | 'wait';
}
export interface MemberResponseNotification {
  content: string;
  time: Date | number;
}

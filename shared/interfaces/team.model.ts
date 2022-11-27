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
  tdateCreated: number;
  tageCat: 15 | 19 | 21 | 25 | 30;
  captainName: string;
  tslogan?: string;
  tdesc?: string;
  tSocials?: SocialMediaLinks | null;
}

export interface TeamStats {
  fkc_played: number;
  fcp_played: number;
  fpl_played: number;
  w: number;
  g: number;
  l: number;
  rcards: number;
  ycards: number;
  g_conceded: number;
  pr_tour_wins?: number;
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
export class TeamStats {
  fkc_played = 0;
  fcp_played = 0;
  fpl_played = 0;
  w = 0;
  g = 0;
  l = 0;
  rcards = 0;
  ycards = 0;
  g_conceded = 0;
  pr_tour_wins?= 0;
}

export interface ITeamInfo {
  id: string;
  name: string;
}

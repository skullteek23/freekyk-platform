import { ListOption } from './others.model';
import { SocialMediaLinks } from './user.model';

export const NO_TEAM = 'NO_TEAM';
export const CAPTAIN_ONLY = 'CAPTAIN_ONLY';
export const MEMBER_ONLY = 'MEMBER_ONLY';
export const ALREADY_IN_TEAM = 'ALREADY_IN_TEAM';
export const INCOMPLETE_PROFILE = 'INCOMPLETE_PROFILE';
export const PHOTO_NOT_UPLOADED = 'PHOTO_NOT_UPLOADED';

export const allowedAgeCategories = [
  { viewValue: 'U-15', value: 15 },
  { viewValue: 'U-16', value: 16 },
  { viewValue: 'U-19', value: 19 },
  { viewValue: 'U-23', value: 23 },
  { viewValue: 'U-30', value: 30 },
  { viewValue: 'Open Age', value: 99 }
];

export const Formatters = {
  formatAgeCategory: (key: AGE_CATEGORY): ListOption => {
    const element = allowedAgeCategories.find(el => el.value === key)
    return element || allowedAgeCategories[allowedAgeCategories.length - 1];
  }
}

export type AGE_CATEGORY = 15 | 16 | 19 | 23 | 30 | 99;
export interface TeamBasicInfo {
  tname: string;
  isVerified: boolean;
  imgpath: string;
  imgpath_logo: string;
  captainId: string;
  captainName: string;
  locState?: string;
  locCity?: string;
  id?: string;
}
export interface TeamMoreInfo {
  tdateCreated: number;
  tageCat: AGE_CATEGORY;
  captainName: string;
  tslogan?: string;
  tdesc?: string;
  tSocials?: SocialMediaLinks | null;
}
export interface ITeam {
  name: string;
  imgpath: string;
  imgpath_logo: string;
  captain: {
    id: string,
    name: string
  };
  locState: string;
  locCity: string;
  tdateCreated: number;
  tageCat: AGE_CATEGORY;
  id?: string;
}
export interface ITeamDescription {
  slogan?: string;
  description?: string;
}

export interface ITeamMembers {
  members: string[];
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

export interface IUserChat {
  title: string;
  description?: string;
  referenceID: string; // either stores teamID or season ID
  by: string;
  byUID: string;
  date: number;
  id?: string
}
export interface IUserChatReply {
  reply: string;
  userChatID: string;
  by: string; // contains Name
  date: number;
  byUID: string; // contains UID
  id?: string;
}

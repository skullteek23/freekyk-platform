export interface IPlayer {
  name: string;
  teamID: string;
  isCaptain: boolean;
  imgpath: string;
  locCity: string;
  locState: string;
  locCountry: string;
  gender: 'M' | 'F';
  position: string;
  born: number;
  id?: string
}

export interface IPlayerMore {
  nickname: string;
  bio: string;
  strongFoot: 'L' | 'R';
  jerseyNo: number;
  id?: string;
}
export interface IPlayerStats {
  apps: number;
  g: number;
  w: number;
  rcards: number;
  ycards: number;
  l: number;
  id?: string
}

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
  born?: number;
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
  born?: number;
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
  validity: number;
  paymentId: string;
}
export class BasicStats {
  apps = 0;
  g = 0;
  w = 0;
  rcards = 0;
  ycards = 0;
  l = 0;
}
export class FsStats {
  sk_lvl = 0;
  br_colb?: BrandCollabInfo[] = [];
  top_vids?: string[] = [];
  tr_a?: number = 0;
  tr_w?: number = 0;
  tr_u?: number = 0;
}

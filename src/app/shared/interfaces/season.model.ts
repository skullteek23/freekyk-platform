import { GroundPrivateInfo } from "./ground.model";

export type statusType = 'PUBLISHED' | 'DRAFTED' | 'FINISHED' | 'READY TO PUBLISH';
export interface SeasonBasicInfo {
  name: string;
  imgpath: string;
  locCity: string;
  locState: string;
  premium: boolean;
  p_teams: number;
  start_date: number;
  cont_tour: string[];
  feesPerTeam: number;
  discount: number;
  status: statusType;
  id?: string;
}
export interface SeasonAbout {
  description: string;
  rules: string;
  paymentMethod: 'Online' | 'Offline';
}
export interface SeasonMedia {
  photo_1: string;
  photo_2: string;
  photo_3: string;
  photo_4: string;
  photo_5: string;
}
export class SeasonStats {
  // FKC_winner?: string;
  // FPL_winner?: string;
  // awards: string;
  g: number = 0;
  rcards: number = 0;
  ycards: number = 0;
  // highestScorer: string;
}
export interface SeasonParticipants {
  tid: string;
  tname: string;
  tlogo: string;
}

export interface SeasonDraft {
  lastUpdated: number;
  draftID: string;
  status: statusType;
  basicInfo?: any;
  grounds?: GroundPrivateInfo[];
}

import { GroundPrivateInfo } from './ground.model';
import { TournamentTypes } from './match.model';

export type statusType = 'PUBLISHED' | 'DRAFTED' | 'FINISHED' | 'READY TO PUBLISH';
export interface SeasonBasicInfo {
  name: string;
  imgpath: string;
  locCity: string;
  locState: string;
  premium: boolean;
  p_teams: number;
  start_date: number;
  cont_tour: TournamentTypes[];
  feesPerTeam: number;
  discount: number;
  status: statusType;
  lastRegDate: number;
  leftOverMatchCount: number;
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
  g = 0;
  rcards = 0;
  ycards = 0;
  // highestScorer: string;
}
export interface SeasonParticipants {
  tid: string;
  name: string;
  logo: string;
}

export interface SeasonDraft {
  lastUpdated: number;
  draftID: string;
  status: statusType;
  basicInfo?: any;
  grounds?: GroundPrivateInfo[];
}

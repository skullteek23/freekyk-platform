import { MATCH_TYPES_PACKAGES } from '@shared/constants/constants';
import { IGroundSelection } from './ground.model';
import { IDummyFixture, TournamentTypes } from './match.model';
import { ITeamInfo } from './team.model';

export type statusType = 'PUBLISHED' | 'FINISHED' | 'CANCELLED' | 'REMOVED';
export interface SeasonBasicInfo {
  name: string;
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
  lastUpdated: number;
  createdBy: string;
  imgpath?: string;
  id?: string;
  discountedFees?: number;
}
export interface SeasonAbout {
  description: string;
  rules: string;
  paymentMethod: 'Online' | 'Offline';
  allowedParticipants?: string[];
}
export interface SeasonMedia {
  photos: string[];
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

export enum LastParticipationDate {
  sameDate = 'Same as Tournament Start Date', // 0
  oneDayBefore = '1 day before Start Date', // 86400
  threeDayBefore = '3 days before Start Date', // 259200
  oneWeekBefore = '1 week before Start Date', // 604800
};


export interface ISelectMatchType {
  package: MATCH_TYPES_PACKAGES;
  startDate: string;
  location: {
    country: string;
    state: string;
    city: string;
  }
  participatingTeamsCount: number;
  containingTournaments: TournamentTypes[]
}

export interface ISeasonDetails {
  name: string;
  description: string;
  rules: string;
  fees: number;
  discount: number;
  lastRegistrationDate: string
}

export interface ISeasonFixtures {
  fixtures: IDummyFixture[]
}

export interface ISelectTeam {
  participants: ITeamInfo[];
}

export type ISelectGrounds = IGroundSelection[];
export interface IDummyFixtureOptions {
  grounds?: IGroundSelection[];
  season?: string;
  fcpMatches?: number;
  fkcMatches?: number;
  fplMatches?: number;
}

export interface ISeasonSummaryData {
  name: string;
  startDate: string;
  endDate: string;
  grounds: string;
  location: string;
  fees: string;
  discount: number;
  participants: string;
  containingTournaments: string;
}

export interface ISummaryDataSource {
  label: string;
  value: string | number;
  type?: string;
}

export interface ISeasonCloudFnData {
  matchType: ISelectMatchType;
  seasonDetails: ISeasonDetails;
  fixtures: ISeasonFixtures;
  teams: ISelectTeam;
  grounds: ISelectGrounds;
  seasonID: string;
  adminID: string
}

export interface ISeasonPartner {
  name: string;
  imgpath: string;
  website: string;
  seasonID: string;
  id?: string;
}

export interface ICloudCancelData {
  reason: string;
  description: string;
  uid: string;
  seasonID: string
}

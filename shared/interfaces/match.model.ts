import { MatchConstants } from '@shared/constants/constants';
import { ListOption } from './others.model';

export type TournamentTypes = 'FKC' | 'FCP' | 'FPL';
export type KnockoutRounds = 2 | 4 | 8 | 16;
export type CancellationTypes = 'abort-match' | 'cancel-match' | 'cancel-season';
export enum MatchStatus {
  ONT = 0, // match time hasn't started
  ONG = 1, // match time is going on
  SNU = 2, // match time has occurred
  RES = 3, // match is rescheduled
  CAN = 4, // match is cancelled by any manual action
  CNS = 5, // match is cancelled by season cancellation action
  ABT = 6, // match is aborted by any manual action
  STD = 7, // match stats are disputed
  STU = 8, // match stats are updated (at least once)
}

export const StatusMessage = [
  // match time hasn't started
  { code: MatchStatus.ONT, shortMsg: 'On-time', description: 'This match is on-time', color: '#4bb242', textColor: '#ffffff' },

  // match time is going on
  { code: MatchStatus.ONG, shortMsg: 'live', description: 'This match is currently live!', color: '#ff5837', textColor: '#ffffff' },

  // match time has occurred
  { code: MatchStatus.SNU, shortMsg: 'pending', description: 'Match stats are not yet uploaded for this match! Please check back later.', color: '#fbbe28', textColor: '#000' },

  // match is rescheduled
  { code: MatchStatus.RES, shortMsg: 'rescheduled', description: 'This match is rescheduled by the organizer', color: '#a9a9a9', textColor: '#ffffff' },

  // match is cancelled by any manual action
  { code: MatchStatus.CAN, shortMsg: 'cancelled', description: 'This match is cancelled by the organizer', color: '#b60000', textColor: '#ffffff' },

  // match is cancelled by any manual action
  { code: MatchStatus.CNS, shortMsg: 'cancelled season', description: 'This match is cancelled due to season cancellation by the organizer', color: '#b60000', textColor: '#ffffff' },

  // match is aborted by any manual action
  { code: MatchStatus.ABT, shortMsg: 'aborted', description: 'This match is aborted by the organizer', color: '#b60000', textColor: '#ffffff' },

  // match stats are disputed
  { code: MatchStatus.STD, shortMsg: 'conflict', description: 'Match stats corrections is pending for this match! Please check back later.', color: '#f20505', textColor: '#ffffff' },

  // match stats are updated (at least once)
  { code: MatchStatus.STU, shortMsg: 'finished', description: 'Match stats are updated by the organizer. Please check Stats section', color: '#00810f', textColor: '#ffffff' },
]

export class ParseMatchProperties {
  static getTimeDrivenStatus(status: MatchStatus, matchTimestamp: number): MatchStatus {
    const currentTimestamp = new Date().getTime();
    const finishTimestamp = matchTimestamp + (MatchConstants.ONE_MATCH_DURATION * MatchConstants.ONE_HOUR_IN_MILLIS);
    if (status === MatchStatus.ONT) {
      if (currentTimestamp < finishTimestamp && currentTimestamp >= matchTimestamp) return MatchStatus.ONG;
      else if (currentTimestamp >= finishTimestamp) return MatchStatus.SNU;
      else return MatchStatus.ONT;
    }
    return status;
  }

  static getComparatorTimestampForBackendQuery(): number {
    const currentTimestamp = new Date().getTime();
    const oneHourLessTimestamp = currentTimestamp - (MatchConstants.ONE_MATCH_DURATION * MatchConstants.ONE_HOUR_IN_MILLIS);
    return oneHourLessTimestamp;
  }

  static getStatusDescription(status: MatchStatus): string {
    return Formatters.formatStatus(status) ? Formatters.formatStatus(status).description : MatchConstants.LABEL_NOT_AVAILABLE;
  }

  static isResult(date: number) {
    return (date + (MatchConstants.ONE_MATCH_DURATION * MatchConstants.ONE_HOUR_IN_MILLIS)) <= new Date().getTime();
  }
}

export const Formatters = {
  formatStatus: (key: number): any => {
    return StatusMessage[key];
  }
}

export interface MatchFixture {
  date: number;
  concluded: boolean;
  home: {
    name: string;
    logo: string;
    score?: number;
  };
  away: {
    name: string;
    logo: string;
    score?: number;
  };
  teams: string[];
  season: string;
  premium: boolean;
  type: TournamentTypes;
  status?: MatchStatus;
  id?: string;
  tie_breaker?: string;
  ground?: string;
  groundID?: string;
  fkcRound?: KnockoutRounds;
}
export interface MatchFixtureOverview {
  ref: string;
  ref_phno?: number;
  stadium: string;
  desc: string;
  organizer: string;
  org_phno?: number;
  refresh: boolean;
  refresh_phno?: number;
  addr_line?: string;
  replay_link?: string;
  live_link?: string;
}
export interface MatchLineup {
  home: string[];
  away: string[];
}
export interface MatchStats {
  homeScore: number;
  awayScore: number;
  penalties: boolean;
  matchEndDate: number;
  sname: string;
  mid: string;
  pen_resultHome?: number;
  pen_resultAway?: number;
  scorersHome?: string[];
  scorersAway?: string[];
}

export interface tempFixtureData {
  date: number;
  teams: string[];
  logos: string[];
  season: string;
  type: string;
  locCity: string;
  locState: string;
  stadium: string;
}
export interface tempFullFixtureData {
  fixture: MatchFixture;
  overview: MatchFixtureOverview;
  lineup: MatchLineup;
}
export interface IDummyFixture {
  date: number;
  concluded: boolean;
  season: string;
  premium: boolean;
  type: TournamentTypes;
  home: string;
  away: string;
  status: MatchStatus;
  id?: string;
  ground?: string;
  groundID?: string;
  fkcRound?: number;
  timestamp?: number;
  actionDisabled?: boolean;
}
export class ReportSummary {
  team: ReportData = { cols: [], displayCols: [], dataSource: [] };
  player: ReportData = { cols: [], displayCols: [], dataSource: [] };
  season: ReportData = { cols: [], displayCols: [], dataSource: [] };
}

export class ReportUpdates {
  homeTeam: UpdateData[] = [];
  awayTeam: UpdateData[] = [];
  player: UpdateData[] = [];
  season: UpdateData[] = [];
}

export interface UpdateData {
  statName: string;
  statValue: any;
}

export interface ReportData {
  cols: ListOption[];
  displayCols: string[];
  dataSource: any[];
}

export interface MatchReportFormData {
  homeScore: number;
  awayScore: number;
  penalties: number;
  homePenScore: number;
  awayPenScore: number;
  scorersHome: ListOption[];
  scorersAway: ListOption[];
  scorersGoalsHome: number[];
  scorersGoalsAway: number[];
  redCardHoldersHome: ListOption[];
  redCardHoldersAway: ListOption[];
  yellowCardHoldersHome: ListOption[];
  yellowCardHoldersAway: ListOption[];
  billsFile: File;
  matchReportFile: File;
  moneySpent: number;
  referee: string;
  specialNotes: string;
}

export interface MatchDayReport {
  score: {
    home: number;
    away: number;
  };
  referee: string;
  specialNotes?: string;
  scorers?: {
    home: string[];
    away: string[];
  };
  cards?: {
    red: string[];
    yellow: string[];
  };
  penalities?: {
    home: number;
    away: number;
  };
}

export interface CloudFunctionStatsData {
  highestScorer: string;
  totGoals: number;
  fkc_played: number;
  fcp_played: number;
  fpl_played: number;
  allPlayersList: string[];
}

export interface ICancelData {
  reason: string;
  description: string;
  docID: string;
  date: number;
  uid: string,
  type: CancellationTypes,
}

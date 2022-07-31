import { Timestamp } from '@firebase/firestore-types';
export interface MatchFixture {
  date: Timestamp;
  concluded: boolean;
  teams: string[];
  logos: string[];
  season: string;
  premium: boolean;
  type: 'FKC' | 'FCP' | 'FPL';
  locCity: string;
  locState: string;
  score?: number[];
  id?: string;
  tie_breaker?: string;
  stadium?: string;
  mode?: 'fixture' | 'result';
  fkc_status?: 'R16' | 'R8' | 'R4' | 'F';
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
  matchEndDate: Timestamp;
  sname: string;
  mid: string;
  pen_resultHome?: number;
  pen_resultAway?: number;
  scorersHome?: string[];
  scorersAway?: string[];
}

export interface tempFixtureData {
  date: Timestamp;
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
export interface dummyFixture {
  date: Date;
  concluded: boolean;
  season: string;
  premium: boolean;
  type: 'FKC' | 'FCP' | 'FPL';
  locCity: string;
  locState: string;
  id?: string;
  stadium?: string;
  fkc_status?: 'R16' | 'R8' | 'R4' | 'F';
}

export type KnockoutStages = 'R16' | 'R8' | 'R4' | 'F';
export type TournamentTypes = 'FKC' | 'FCP' | 'FPL';
export interface MatchFixture {
  date: number;
  concluded: boolean;
  home: {
    name: string,
    logo: string,
    score: number
  };
  away: {
    name: string,
    logo: string,
    score: number
  };
  teams: string[];
  season: string;
  premium: boolean;
  type: TournamentTypes;
  locCity: string;
  locState: string;
  id?: string;
  tie_breaker?: string;
  stadium?: string;
  fkc_status?: KnockoutStages;
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
export interface dummyFixture {
  date: number;
  concluded: boolean;
  season: string;
  premium: boolean;
  type: TournamentTypes;
  locCity: string;
  locState: string;
  id?: string;
  stadium?: string;
  fkc_status?: KnockoutStages;
  timestamp?: number;
}

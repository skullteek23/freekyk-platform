import { Action } from '@ngrx/store';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import {
  TeamBasicInfo,
  TeamMoreInfo,
  TeamMembers,
  TeamStats,
} from 'src/app/shared/interfaces/team.model';

export const ADD_BASIC_INFO = '[TeamActions] add basic team info';
export const ADD_MORE_INFO = '[TeamActions] add more team info';
export const ADD_UPCOMING_MATCHES =
  '[TeamActions] add atmost 3 upcoming matches';
export const ADD_MEMBERS = '[TeamActions] add team members';
export const ADD_TEAM_STATS = '[TeamActions] add team basic stats';

export class AddBasicInfo implements Action {
  readonly type = ADD_BASIC_INFO;
  constructor(public payload: TeamBasicInfo) {}
}
export class AddMoreInfo implements Action {
  readonly type = ADD_MORE_INFO;
  constructor(public payload: TeamMoreInfo) {}
}
export class AddMembers implements Action {
  readonly type = ADD_MEMBERS;
  constructor(public payload: TeamMembers) {}
}
export class AddUpcomingMatches implements Action {
  readonly type = ADD_UPCOMING_MATCHES;
  constructor(public payload: MatchFixture[]) {}
}
export class AddTeamStats implements Action {
  readonly type = ADD_TEAM_STATS;
  constructor(public payload: TeamStats) {}
}

export type TeamActionsType =
  | AddBasicInfo
  | AddMoreInfo
  | AddUpcomingMatches
  | AddMembers
  | AddTeamStats;

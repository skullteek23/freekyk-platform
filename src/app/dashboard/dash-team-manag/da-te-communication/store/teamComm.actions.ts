import { Action } from '@ngrx/store';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import { ActiveSquadMember } from 'src/app/shared/interfaces/team.model';

// export const SELECTED_UPCOMING_MATCH =
//   '[TeamCommsActions] selected upcoming match ';
export const SELECTED_ACTIVE_SQUAD = '[TeamCommsActions] selected active squad';
export const SELECT_UPCOMING_MATCH_NO =
  '[TeamCommsActions] selected match number - 1|2|3';
// export const MATCH_EXISTS =
//   '[TeamCommsActions] stores whether selected match exists';
// export const SQUAD_EXISTS =
//   '[TeamCommsActions] stores whether selected match squad exists';

// export class SelectedUpmMatch implements Action {
//   readonly type = SELECTED_UPCOMING_MATCH;
//   constructor(public payload: MatchFixture) {}
// }
export class SelectedActiveSquad implements Action {
  readonly type = SELECTED_ACTIVE_SQUAD;
  constructor(public payload: ActiveSquadMember[]) {}
}
export class SelectUpmMatchNo implements Action {
  readonly type = SELECT_UPCOMING_MATCH_NO;
  constructor(public payload: number) {}
}
// export class MatchExists implements Action {
//   readonly type = MATCH_EXISTS;
//   constructor(public payload: boolean) {}
// }
// export class SquadExists implements Action {
//   readonly type = SQUAD_EXISTS;
//   constructor(public payload: boolean) {}
// }

export type TeamCommActionTypes =
  // | SelectedUpmMatch
  SelectedActiveSquad | SelectUpmMatchNo;
// | MatchExists | SquadExists;

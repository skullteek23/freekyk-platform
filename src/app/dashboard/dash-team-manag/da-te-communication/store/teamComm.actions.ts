import { Action } from '@ngrx/store';
import { ActiveSquadMember } from '@shared/interfaces/team.model';

export const SELECTED_ACTIVE_SQUAD = '[TeamCommsActions] selected active squad';
export const SELECT_UPCOMING_MATCH_NO =
  '[TeamCommsActions] selected match number - 1|2|3';
export class SelectedActiveSquad implements Action {
  readonly type = SELECTED_ACTIVE_SQUAD;
  constructor(public payload: ActiveSquadMember[]) { }
}
export class SelectUpmMatchNo implements Action {
  readonly type = SELECT_UPCOMING_MATCH_NO;
  constructor(public payload: number) { }
}

export type TeamCommActionTypes = SelectedActiveSquad | SelectUpmMatchNo;

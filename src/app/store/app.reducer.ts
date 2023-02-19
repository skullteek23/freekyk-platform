import * as fromDash from '../dashboard/store/dash.reducer';
import * as fromTeam from '../dashboard/dash-team-manag/store/team.reducer';
import { ActionReducerMap } from '@ngrx/store';

export interface AppState {
  dash: fromDash.DashState;
  team: fromTeam.TeamState;
}

export const appReducer: ActionReducerMap<AppState> = {
  dash: fromDash.dashReducer,
  team: fromTeam.teamReducer,
};

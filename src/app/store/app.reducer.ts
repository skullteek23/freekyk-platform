import * as fromDash from '../dashboard/store/dash.reducer';
import * as fromTeam from '../dashboard/dash-team-manag/store/team.reducer';
import * as fromTeamComm from '../dashboard/dash-team-manag/da-te-communication/store/teamComm.reducer';
import { ActionReducerMap } from '@ngrx/store';

export interface AppState {
  dash: fromDash.DashState;
  team: fromTeam.TeamState;
  teamComms: fromTeamComm.TeamCommState;
}

export const appReducer: ActionReducerMap<AppState> = {
  dash: fromDash.dashReducer,
  team: fromTeam.teamReducer,
  teamComms: fromTeamComm.teamCommReducer,
};

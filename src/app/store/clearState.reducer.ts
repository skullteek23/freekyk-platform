import { Action } from '@ngrx/store';
import * as DashState from '../dashboard/store/dash.reducer';
import * as TeamState from '../dashboard/dash-team-manag/store/team.reducer';
import * as TeamCommState from '../dashboard/dash-team-manag/da-te-communication/store/teamComm.reducer';
export function clearState(reducer) {
  return function (state, action) {
    if (action.type === ActionTypes.LOGOUT) {
      state = {
        dash: DashState.initialState,
        team: TeamState.initialState,
        teamComm: TeamCommState.initialState,
      };
    }

    return reducer(state, action);
  };
}
export class ActionTypes {
  static LOGOUT = '[App] logout';
}

export class Logout implements Action {
  readonly type = ActionTypes.LOGOUT;
}

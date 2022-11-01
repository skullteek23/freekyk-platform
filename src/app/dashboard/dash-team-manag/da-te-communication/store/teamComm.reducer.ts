import { ActiveSquadMember } from '@shared/interfaces/team.model';
import * as TeamCommActions from './teamComm.actions';
export interface TeamCommState {
  currUpcomingMatchNo: number;
  activeSquad: ActiveSquadMember[];
}
export const initialState = {
  currUpcomingMatchNo: -1,
  activeSquad: [],
};
export function teamCommReducer(
  state: TeamCommState = initialState,
  action: TeamCommActions.TeamCommActionTypes
): TeamCommState {
  switch (action.type) {
    case TeamCommActions.SELECTED_ACTIVE_SQUAD:
      return {
        ...state,
        activeSquad: [...action.payload],
      };
    case TeamCommActions.SELECT_UPCOMING_MATCH_NO:
      return {
        ...state,
        currUpcomingMatchNo: action.payload,
      };

    default:
      return state;
  }
}

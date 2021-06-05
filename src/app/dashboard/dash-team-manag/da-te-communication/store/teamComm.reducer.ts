import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import { ActiveSquadMember } from 'src/app/shared/interfaces/team.model';
import * as TeamCommActions from './teamComm.actions';
export interface TeamCommState {
  // upcomingMatch: MatchFixture;
  currUpcomingMatchNo: number;
  // matchExists: boolean;
  // squadExists: boolean;
  activeSquad: ActiveSquadMember[];
}
export const initialState = {
  // upcomingMatch: null,
  currUpcomingMatchNo: -1,
  // matchExists: false,
  // squadExists: false,
  activeSquad: [],
};
export function teamCommReducer(
  state: TeamCommState = initialState,
  action: TeamCommActions.TeamCommActionTypes
) {
  switch (action.type) {
    // case TeamCommActions.SELECTED_UPCOMING_MATCH:
    //   return {
    //     ...state,
    //     upcomingMatch: {
    //       ...action.payload,
    //     },
    //   };
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
    // case TeamCommActions.MATCH_EXISTS:
    //   return {
    //     ...state,
    //     matchExists: action.payload,
    //   };
    // case TeamCommActions.SQUAD_EXISTS:
    //   return {
    //     ...state,
    //     squadExists: action.payload,
    //   };

    default:
      return state;
  }
}

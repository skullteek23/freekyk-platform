import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import {
  TeamBasicInfo,
  TeamMoreInfo,
  TeamMembers,
  TeamStats,
} from 'src/app/shared/interfaces/team.model';
import * as TeamActions from './team.actions';
export interface TeamState {
  basicInfo: TeamBasicInfo;
  moreInfo: TeamMoreInfo;
  teamMembers: TeamMembers;
  stats: TeamStats;
  upcomingMatches: MatchFixture[];
}
export const initialState = {
  basicInfo: {
    tname: null,
    isVerified: null,
    imgpath: null,
    imgpath_logo: null,
    captainId: null,
    locState: null,
    locCity: null,
  },
  moreInfo: {
    tdateCreated: null,
    tageCat: null,
    captainName: null,
    tslogan: null,
    tdesc: null,
    tSocials: null,
  },
  teamMembers: {
    memCount: 0,
    members: [],
  },
  stats: {
    fcp_played: 0,
    fkc_played: 0,
    fpl_played: 0,
    w: 0,
    g: 0,
    l: 0,
    rcards: 0,
    ycards: 0,
    cl_sheet: 0,
    g_conceded: 0,
    pr_tour_wins: 0,
  },
  upcomingMatches: [],
};
export function teamReducer(
  state: TeamState = initialState,
  action: TeamActions.TeamActionsType
): TeamState {
  switch (action.type) {
    case TeamActions.ADD_BASIC_INFO:
      return {
        ...state,
        basicInfo: {
          ...state.basicInfo,
          ...action.payload,
        },
      };
    case TeamActions.ADD_MORE_INFO:
      return {
        ...state,
        moreInfo: {
          ...state.moreInfo,
          ...action.payload,
        },
      };
    case TeamActions.ADD_MEMBERS:
      return {
        ...state,
        teamMembers: {
          ...state.teamMembers,
          ...action.payload,
        },
      };
    case TeamActions.ADD_UPCOMING_MATCHES:
      return {
        ...state,
        upcomingMatches: [...action.payload],
      };
    case TeamActions.ADD_TEAM_STATS:
      return {
        ...state,
        stats: {
          ...state.stats,
          ...action.payload,
        },
      };

    default:
      return state;
  }
}

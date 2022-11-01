import {
  PlayerBasicInfo,
  PlayerMoreInfo,
  FsBasic,
  SocialMediaLinks,
} from '@shared/interfaces/user.model';
import * as DashActions from './dash.actions';

export interface DashState {
  playerBasicInfo: PlayerBasicInfo;
  playerMoreInfo: PlayerMoreInfo;
  fsInfo: FsBasic;
  socials: SocialMediaLinks;
  isCaptain: boolean;
  hasTeam: { name: string; id: string; capId: string };
}

export const initialState: DashState = {
  playerBasicInfo: {
    name: null,
    team: null,
    imgpath_sm: null,
    gen: null,
    jer_no: null,
    locCity: null,
    pl_pos: null,
    id: null,
  },
  playerMoreInfo: {
    profile: false,
    imgpath_lg: null,
    born: null,
    locState: null,
    locCountry: null,
    nickname: null,
    height: null,
    weight: null,
    bio: null,
    str_ft: null,
    prof_teams: [],
    prof_tours: [],
  },
  fsInfo: {
    name: null,
    nickname: null,
    imgpath_lg: null,
    born: null,
    locCountry: null,
    bio: null,
  },
  socials: {
    fb: null,
    ig: null,
    yt: null,
    tw: null,
  },
  isCaptain: false,
  hasTeam: null,
};
export function dashReducer(
  state: DashState = initialState,
  action: DashActions.DashActionsType
): DashState {
  switch (action.type) {
    case DashActions.ADD_BASIC_INFO:
      return {
        ...state,

        playerBasicInfo: {
          ...state.playerBasicInfo,
          ...action.payload,
        },
      };
    case DashActions.ADD_MORE_INFO:
      return {
        ...state,
        playerMoreInfo: {
          ...state.playerMoreInfo,
          ...action.payload,
        },
      };
    case DashActions.ADD_SOCIALS:
      return {
        ...state,
        socials: {
          ...state.socials,
          ...action.payload,
        },
      };
    case DashActions.ADD_FS_INFO:
      return {
        ...state,
        fsInfo: {
          ...state.fsInfo,
          ...action.payload,
        },
      };
    case DashActions.CHECK_PLAYER_HAS_TEAM:
      return {
        ...state,
        hasTeam: {
          ...action.payload,
        },
      };
    case DashActions.CHECK_PLAYER_IS_CAPTAIN:
      return {
        ...state,
        isCaptain: action.payload,
      };

    default:
      return state;
  }
}

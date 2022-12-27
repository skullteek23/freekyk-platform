import { Action } from '@ngrx/store';
import {
  PlayerBasicInfo,
  PlayerMoreInfo,
  SocialMediaLinks,
  FsBasic,
} from '@shared/interfaces/user.model';

export const ADD_BASIC_INFO = '[DashActions] add basic player info';
export const CHECK_PLAYER_HAS_TEAM = '[DashActions] checks if player has team';
export const CHECK_PLAYER_IS_CAPTAIN =
  '[DashActions] checks if player is team captain';
export const ADD_MORE_INFO = '[DashActions] add additional player info';
export const ADD_SOCIALS = '[DashActions] add socials';
export const ADD_FS_INFO = '[DashActions] add freestyler info';

export class AddBasicInfo implements Action {
  readonly type = ADD_BASIC_INFO;
  constructor(public payload: PlayerBasicInfo) { }
}
export class AddMoreInfo implements Action {
  readonly type = ADD_MORE_INFO;
  constructor(public payload: PlayerMoreInfo) { }
}
export class AddSocials implements Action {
  readonly type = ADD_SOCIALS;
  constructor(public payload: SocialMediaLinks) { }
}
export class AddFsInfo implements Action {
  readonly type = ADD_FS_INFO;
  constructor(public payload: FsBasic) { }
}
export class CheckPlayerHasTeam implements Action {
  readonly type = CHECK_PLAYER_HAS_TEAM;
  constructor(public payload: { name: string; id: string; capId: string }) { }
}
export class CheckPlayerIsCaptain implements Action {
  readonly type = CHECK_PLAYER_IS_CAPTAIN;
  constructor(public payload: boolean) { }
}

export type DashActionsType =
  | AddBasicInfo
  | AddMoreInfo
  | AddSocials
  | AddFsInfo
  | CheckPlayerHasTeam
  | CheckPlayerIsCaptain;

import { Injectable } from '@angular/core';
import { MAXIMUM_VALUE } from '@app/services/onboarding-steps-tracker.service';
import { ApiGetService } from '@shared/services/api.service';
import { PlayerAllInfo, TeamAllInfo } from '@shared/utils/pipe-functions';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private player: Partial<PlayerAllInfo> = null;
  private team: Partial<TeamAllInfo> = null;

  constructor(
    private apiService: ApiGetService
  ) { }

  get _player(): Partial<PlayerAllInfo> {
    if (this.player?.id) {
      return this.player;
    }
    return null;
  }

  get _team(): Partial<TeamAllInfo> {
    if (this.team?.id) {
      return this.team;
    }
    return null;
  }

  setPlayer(val: Partial<PlayerAllInfo>) {
    if (val) {
      this.player = val;
    }
  }

  setTeam(val: Partial<TeamAllInfo>) {
    if (val) {
      this.team = val;
    }
  }

  getProfileProgress(player: Partial<PlayerAllInfo>) {
    if (!player) {
      const profileShortcutData = {
        actionLabel: 'My Profile',
        secondaryLabel: '0% Done',
        icon: 'account_circle',
      };
      return profileShortcutData;
    }
    let profileProgress = 0;
    if (player.id) {
      profileProgress += 20;
    }
    if (player.position) {
      profileProgress += 20;
    }
    if (player.jerseyNo) {
      profileProgress += 20;
    }
    if (player.imgpath) {
      profileProgress += 20;
    }
    if (player.hasOwnProperty('teamID')) {
      profileProgress += 20;
    }
    const label = `${profileProgress}% Done`;
    const profileShortcutData = {
      actionLabel: 'My Profile',
      secondaryLabel: profileProgress === MAXIMUM_VALUE ? null : label,
      secondaryIcon: profileProgress === MAXIMUM_VALUE ? 'check_circle' : null,
      icon: 'account_circle',
    };
    return profileShortcutData;
  }

}

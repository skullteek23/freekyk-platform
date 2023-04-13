import { Component, OnInit } from '@angular/core';
import { IStatisticsCard } from '@app/dashboard/dash-home/my-stats-card/my-stats-card.component';
import { AuthService } from '@app/services/auth.service';
import { EnlargeService } from '@app/services/enlarge.service';
import { MatchConstants } from '@shared/constants/constants';
import { ListOption } from '@shared/interfaces/others.model';
import { ApiGetService } from '@shared/services/api.service';
import { PlayerAllInfo } from '@shared/utils/pipe-functions';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {

  player: Partial<PlayerAllInfo>;
  stats: IStatisticsCard[] = [];
  properties: ListOption[] = [];
  quickLinks: ListOption[] = [
    { viewValue: 'Orders', value: '/orders' },
    { viewValue: 'Notifications', value: '/notifications' },
    { viewValue: 'Addresses', value: '/addresses' },
  ];

  constructor(
    private authService: AuthService,
    private apiService: ApiGetService,
    private enlargeService: EnlargeService,
  ) { }

  ngOnInit(): void {
    this.getProfileData();
  }

  getProfileData() {
    this.authService.isLoggedIn()
      .subscribe({
        next: user => {
          if (user) {
            this.apiService.getPlayerAllInfo(user.uid)
              .subscribe({
                next: (response) => {
                  if (response) {
                    this.player = response;
                  }
                  this.parseStats();
                  this.parseProfileDetails();
                }
              })
          }
        }
      })
  }

  parseStats() {
    this.stats = [];
    this.stats.push({ icon: 'sports_soccer', label: 'Apps', value: this.player?.apps || 0 })
    this.stats.push({ icon: 'sports_soccer', label: 'Goals', value: this.player?.g || 0 })
    this.stats.push({ icon: 'flag', label: 'Wins', value: this.player?.w || 0 })
    this.stats.push({ icon: 'style', label: 'Cards', value: this.player?.rcards || 0, iconClass: 'red' })
    this.stats.push({ icon: 'style', label: 'Cards', value: this.player?.ycards || 0, iconClass: 'yellow' })
    this.stats.push({ icon: 'cancel_presentation', label: 'Losses', value: this.player?.l || 0 })
  }

  async parseProfileDetails() {
    this.properties = [];
    this.properties.push({ value: 'Name', viewValue: this.player?.name });
    this.properties.push({ value: 'Age', viewValue: this.getAge(this.player?.born) });
    this.properties.push({ value: 'Gender', viewValue: this.getGender(this.player?.gender) });
    this.properties.push({ value: 'Team', viewValue: await this.getTeam(this.player?.teamID) });
    this.properties.push({ value: 'Position', viewValue: this.getPosition(this.player?.position) });
    this.properties.push({ value: 'Lives in', viewValue: this.getLocation(this.player?.locCity, this.player?.locState) });
    this.properties.push({ value: 'Strong Foot', viewValue: this.getStrongFoot(this.player?.strongFoot) });
  }

  async getTeam(teamID: string): Promise<string> {
    if (teamID) {
      return (await this.apiService.getTeam(teamID).toPromise()).name;
    }
    return Promise.resolve('No Team');
  }

  openImage() {
    if (this.player?.imgpath) {
      this.enlargeService.onOpenPhoto(this.player.imgpath)
    }
  }

  getAge(value: number): string {
    if (!value) {
      return MatchConstants.LABEL_NOT_AVAILABLE;
    }
    const diffInMilliseconds = Date.now() - value;
    const ageDate = new Date(diffInMilliseconds);
    return Math.abs(ageDate.getUTCFullYear() - 1970).toString() + ' yrs';
  }

  getPosition(position: string): string {
    if (!position) {
      return MatchConstants.LABEL_NOT_AVAILABLE;
    }
    return position;
  }

  getGender(value: 'M' | 'F'): string {
    if (!value) {
      return MatchConstants.LABEL_NOT_AVAILABLE;
    }
    return value === 'M' ? 'Male' : 'Female';
  }

  getStrongFoot(value: 'L' | 'R'): string {
    if (!value) {
      return MatchConstants.LABEL_NOT_AVAILABLE;
    }
    return value === 'L' ? 'Left' : 'Right';
  }

  getLocation(city: string, state: string): string {
    if (!city || !state) {
      return MatchConstants.LABEL_NOT_AVAILABLE;
    } else {
      return `${city}, ${state}`;
    }
  }
}

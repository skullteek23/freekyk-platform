import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { IActionShortcutData } from '@shared/components/action-shortcut-button/action-shortcut-button.component';
import { ApiService } from '@shared/services/api.service';
import { TeamAllInfo } from '@shared/utils/pipe-functions';
import { Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { TeamService } from 'src/app/services/team.service';
import { IStatisticsCard } from '../dash-home/my-stats-card/my-stats-card.component';
import { DashboardService } from '../dashboard.service';
import { DashState } from '../store/dash.reducer';
import { TeamState } from './store/team.reducer';

@Component({
  selector: 'app-dash-team-manag',
  templateUrl: './dash-team-manag.component.html',
  styleUrls: ['./dash-team-manag.component.scss'],
})
export class DashTeamManagComponent implements OnInit, OnDestroy, AfterViewInit {

  subscriptions = new Subscription();
  joinShortcutData: IActionShortcutData;
  ticketShortcutData: IActionShortcutData;
  teamSettingsShortcutData: IActionShortcutData;
  teamGalleryShortcutData: IActionShortcutData;
  isCaptain = false;
  teamStats: IStatisticsCard[] = [];
  isLoaderShown = false;
  team: Partial<TeamAllInfo> = null;

  constructor(
    private teamService: TeamService,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {
    this.getTeamInfo();
  }

  ngAfterViewInit(): void {
    this.subscriptions.add(this.route.fragment.subscribe(response => {
      if (response) {
        const element = document.getElementById(response);
        if (element) {
          element.scrollIntoView();
        }
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getTeamInfo() {
    const team = this.dashboardService._team;
    const player = this.dashboardService._player;
    if (player && team) {
      this.parseTeam(team);
    } else if (player?.teamID) {
      this.isLoaderShown = true;
      this.apiService.getTeamAllInfo(player.teamID)
        .subscribe({
          next: this.parseTeam.bind(this),
          error: this.parseTeam.bind(this)
        })
    } else if (!player) {
      const uid = this.getUID();
      this.isLoaderShown = true;
      this.apiService.getPlayerV2(uid)
        .subscribe({
          next: (response) => {
            if (response?.hasOwnProperty('teamID') && response.teamID !== null) {
              this.apiService.getTeamAllInfo(response.teamID)
                .subscribe({
                  next: this.parseTeam.bind(this),
                  error: this.parseTeam.bind(this)
                })
            } else {
              this.parseTeam(null);
            }
          },
          error: this.parseTeam.bind(this)
        })
    } else if (!player && team) {
      this.parseTeam(team)
    } else {
      this.parseTeam(null);
    }
  }

  parseTeam(resp: Partial<TeamAllInfo>) {
    if (resp) {
      this.team = resp;
    }
    this.createShortcutData();
    this.createTeamStatistics();
    this.isLoaderShown = false;
  }

  createShortcutData() {
    if (!this.team?.id) {
      this.joinShortcutData = {
        actionLabel: 'Create or Join a Team',
        icon: 'add_circle',
      }
      this.teamGalleryShortcutData = null;
    } else {
      this.joinShortcutData = null;
      this.teamGalleryShortcutData = {
        actionLabel: 'My Team Gallery',
        icon: 'photo_library'
      }
    }
    if (this.team?.captainId === this.getUID()) {
      this.teamSettingsShortcutData = {
        actionLabel: 'Team Settings',
        icon: 'tune'
      }
    } else {
      this.teamSettingsShortcutData = null
    }
    this.ticketShortcutData = {
      actionLabel: 'Need help? Raise a ticket',
      icon: 'help'
    }
  }

  createTeamStatistics() {
    const response = this.team;
    this.teamStats = [];
    this.teamStats.push({ icon: 'sports_soccer', label: 'Goals', value: response?.g || 0 });
    this.teamStats.push({ icon: 'flag', label: 'Wins', value: response?.w || 0 });
    this.teamStats.push({ icon: 'cancel_presentation', label: 'Losses', value: response?.l || 0 });
    this.teamStats.push({ icon: 'sports_soccer', label: 'Matches', value: (response?.fkc_played + response?.fcp_played + response?.fpl_played) || 0, });
    this.teamStats.push({ icon: 'style', label: 'Cards', value: response?.rcards || 0, iconClass: 'red' });
    this.teamStats.push({ icon: 'style', label: 'Cards', value: response?.ycards || 0, iconClass: 'yellow' });
    this.teamStats.push({ icon: 'sports_handball', label: 'Conceded', value: response?.g_conceded || 0, });
  }

  openJoinTeam() {
    this.teamService.onOpenJoinTeamDialog();
  }

  openTeamGallery() {
    this.teamService.onOpenTeamGalleryDialog();
  }

  openTeamSettings(): void {
    this.teamService.onOpenTeamSettingsDialog();
  }

  getUID() {
    return JSON.parse(localStorage.getItem('uid'));
  }
}

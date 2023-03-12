import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { IActionShortcutData } from '@shared/components/action-shortcut-button/action-shortcut-button.component';
import { PlayerCardComponent } from '@shared/dialogs/player-card/player-card.component';
import { MatchFixture } from '@shared/interfaces/match.model';
import { TeamService } from 'src/app/services/team.service';
import { IStatisticsCard } from './my-stats-card/my-stats-card.component';
import { RazorPayOrder } from '@shared/interfaces/order.model';
import { DashboardService } from '../dashboard.service';
import { ApiService } from '@shared/services/api.service';
import { PlayerAllInfo } from '@shared/utils/pipe-functions';

@Component({
  selector: 'app-dash-home',
  templateUrl: './dash-home.component.html',
  styleUrls: ['./dash-home.component.scss'],
})
export class DashHomeComponent implements OnInit {

  teamShortcutData: IActionShortcutData = null;
  ticketShortcutData: IActionShortcutData = null;
  profileShortcutData: IActionShortcutData = null;
  teamMatches: MatchFixture[] = [];
  stats: IStatisticsCard[] = [];
  pendingOrdersList: Partial<RazorPayOrder>[] = [];
  player: Partial<PlayerAllInfo> = null;
  upcomingFixture: MatchFixture = null;
  isLoaderShown = false;

  constructor(
    private teamService: TeamService,
    private dialog: MatDialog,
    private router: Router,
    private apiService: ApiService,
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {
    this.getPlayerInfo();
  }

  getPlayerInfo() {
    const uid = JSON.parse(localStorage.getItem('uid'));
    if (uid) {
      this.isLoaderShown = true;
      this.apiService.getPlayerAllInfo(uid)
        .subscribe({
          next: (response) => {
            this.player = response || null;
            this.dashboardService.setPlayer(response);
            this.createShortcutButtonData();
            this.getUserOrders();
            this.getMyMatches();
            this.getUpcomingMatch();
            this.parsePlayerStats();
            this.isLoaderShown = false;
          },
          error: () => {
            this.player = null;
            this.isLoaderShown = false;
          }
        })
    }
  }

  createShortcutButtonData() {
    this.ticketShortcutData = {
      actionLabel: 'Need help? Raise a ticket',
      icon: 'help'
    }
    this.profileShortcutData = this.dashboardService.getProfileProgress(this.player);
    this.teamShortcutData = {
      actionLabel: this.hasTeam ? 'My Team' : 'Create or Join a Team',
      icon: 'groups',
      secondaryIcon: this.hasTeam ? 'check_circle' : 'add_circle'
    };
  }

  getMyMatches() {
    if (this.hasTeam) {
      this.apiService.getTeamFixtures(this.player.teamID)
        .subscribe({
          next: (response) => {
            if (response.length) {
              this.teamMatches = response;
            } else {
              this.teamMatches = [];
            }
          }
        });
    } else {
      this.teamMatches = [];
      this.upcomingFixture = null;
    }
  }

  getUpcomingMatch() {
    if (this.hasTeam) {
      this.apiService.getUpcomingFixture(this.player.teamID)
        .subscribe({
          next: (response) => {
            this.upcomingFixture = null;
            if (response?.length) {
              this.upcomingFixture = response[0];
            }
          }
        });
    } else {
      this.upcomingFixture = null;
    }
  }

  getUserOrders() {
    const uid = JSON.parse(localStorage.getItem('uid'));
    this.apiService.getUserPendingOrders(uid)
      .subscribe({
        next: (response) => {
          if (response) {
            this.pendingOrdersList = response;
          }
        },
        error: () => {
          this.pendingOrdersList = []
        }
      })
  }

  parsePlayerStats() {
    this.stats = [];
    this.stats.push({ icon: 'sports_soccer', label: 'Apps', value: this.player?.apps || 0 })
    this.stats.push({ icon: 'sports_soccer', label: 'Goals', value: this.player?.g || 0 })
    this.stats.push({ icon: 'flag', label: 'Wins', value: this.player?.w || 0 })
    this.stats.push({ icon: 'style', label: 'Cards', value: this.player?.rcards || 0, iconClass: 'red' })
    this.stats.push({ icon: 'style', label: 'Cards', value: this.player?.ycards || 0, iconClass: 'yellow' })
    this.stats.push({ icon: 'cancel_presentation', label: 'Losses', value: this.player?.l || 0 })
  }

  takeTeamAction() {
    if (this.hasTeam) {
      this.router.navigate(['/dashboard', 'team-management'])
    } else {
      this.openJoinTeam();
    }
  }

  openJoinTeam() {
    this.teamService.onOpenJoinTeamDialog();
  }

  openTicketDialog() {
    this.router.navigate(['/support'])
  }

  openProfile() {
    this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: this.player.id,
    });
  }

  navigateToParticipate() {
    this.router.navigate(['/dashboard', 'participate']);
  }

  get hasTeam(): boolean {
    return this.player?.hasOwnProperty('teamID') && this.player.teamID !== null;
  }
}

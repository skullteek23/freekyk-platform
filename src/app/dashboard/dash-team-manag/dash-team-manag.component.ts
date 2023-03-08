import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { IActionShortcutData } from '@shared/components/action-shortcut-button/action-shortcut-button.component';
import { Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { TeamService } from 'src/app/services/team.service';
import { IStatisticsCard } from '../dash-home/my-stats-card/my-stats-card.component';
import { DashState } from '../store/dash.reducer';
import { TeamState } from './store/team.reducer';

@Component({
  selector: 'app-dash-team-manag',
  templateUrl: './dash-team-manag.component.html',
  styleUrls: ['./dash-team-manag.component.scss'],
})
export class DashTeamManagComponent implements OnInit, OnDestroy, AfterViewInit {

  isLoading = true;
  noTeam = false;
  showMobile = false;
  subscriptions = new Subscription();
  joinShortcutData: IActionShortcutData;
  ticketShortcutData: IActionShortcutData;
  teamSettingsShortcutData: IActionShortcutData;
  teamGalleryShortcutData: IActionShortcutData;
  isCaptain = false;
  teamStats: IStatisticsCard[] = [];

  constructor(
    private teamService: TeamService,
    private store: Store<{ dash: DashState; team: TeamState; }>,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.createShortcutData();
    this.getTeamStatistics();
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

  createShortcutData() {
    this.ticketShortcutData = {
      actionLabel: 'Need help? Raise a ticket',
      icon: 'help'
    }
    this.teamGalleryShortcutData = {
      actionLabel: 'My Team Gallery',
      icon: 'photo_library'
    }
    this.getTeamStatus();
  }

  getTeamStatistics() {
    this.subscriptions.add(
      this.store
        .select('team')
        .pipe(
          map((response) => {
            let stats: IStatisticsCard[] = [];
            stats = [
              { icon: 'sports_soccer', label: 'Goals', value: response.stats?.g },
              { icon: 'flag', label: 'Wins', value: response.stats?.w },
              { icon: 'cancel_presentation', label: 'Losses', value: response.stats?.l },
              {
                icon: 'sports_soccer',
                label: 'Matches',
                value: response.stats?.fkc_played + response.stats?.fcp_played + response.stats?.fpl_played,
              },
              { icon: 'style', label: 'Cards', value: response.stats?.rcards, iconClass: 'red' },
              { icon: 'style', label: 'Cards', value: response.stats?.ycards, iconClass: 'yellow' },
              {
                icon: 'sports_handball',
                label: 'Conceded',
                value: response.stats?.g_conceded,
              },
            ];

            return stats;
          })
        )
        .subscribe((response) => (this.teamStats = response))
    )
  }

  getTeamStatus() {
    this.subscriptions.add(this.store.select('team').pipe(take(1))
      .subscribe(response => {
        if (response?.basicInfo?.tname === null) {
          this.joinShortcutData = {
            actionLabel: 'Create or Join a Team',
            icon: 'add_circle',
          }
        } else {
          this.joinShortcutData = null;
        }
        if (response?.basicInfo?.captainId === localStorage.getItem('uid')) {
          this.teamSettingsShortcutData = {
            actionLabel: 'Team Settings',
            icon: 'tune'
          }
        } else {
          this.teamSettingsShortcutData = null;
        }
      }));
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
}

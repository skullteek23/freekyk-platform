import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { SnackbarService } from '@shared/services/snackbar.service';
import { IActionShortcutData } from '@shared/components/action-shortcut-button/action-shortcut-button.component';
import { ApiGetService } from '@shared/services/api.service';
import { TeamAllInfo } from '@shared/utils/pipe-functions';
import { Subscription } from 'rxjs';
import { IStatisticsCard } from '../dash-home/my-stats-card/my-stats-card.component';

@Component({
  selector: 'app-dash-team-manag',
  templateUrl: './dash-team-manag.component.html',
  styleUrls: ['./dash-team-manag.component.scss'],
})
export class DashTeamManagComponent implements OnInit, OnDestroy, AfterViewInit {

  readonly actionShortcutDataRow_Team_Member: IActionShortcutData[] = [
    { icon: 'groups', label: 'View Members', highlight: true, route: '/my-team' },
    { icon: 'collections', label: 'Add Photos', highlight: true, route: '/my-team/gallery' },
    { icon: 'settings', label: 'Team Settings', highlight: false, route: '/my-team/settings' },
    { icon: 'support_agent', label: 'Support', highlight: false, route: '/support' },
  ];
  readonly actionShortcutDataRow_No_Team_Member: IActionShortcutData[] = [
    { icon: 'groups', label: 'Find a team', highlight: true, route: '/teams' },
    { icon: 'collections', label: 'Team Gallery', highlight: false, route: '/my-team/gallery', disabled: true },
    { icon: 'tour', label: 'Challenges', highlight: false, route: '/challenges', disabled: true },
    { icon: 'support_agent', label: 'Support', highlight: false, route: '/support' },
  ];

  subscriptions = new Subscription();
  joinShortcutData: IActionShortcutData;
  ticketShortcutData: IActionShortcutData;
  teamSettingsShortcutData: IActionShortcutData;
  teamGalleryShortcutData: IActionShortcutData;
  isCaptain = false;
  teamStats: IStatisticsCard[] = [];
  isLoaderShown = false;
  team: Partial<TeamAllInfo> = null;
  shortcuts

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiGetService,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private router: Router
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
    this.isLoaderShown = true;
    this.authService.isLoggedIn()
      .subscribe({
        next: async (user) => {
          if (user) {
            // User is logged in
            const player = (await this.apiService.getPlayer(user.uid)?.toPromise());
            const team = (await this.apiService.getTeamAllInfo(player.teamID)?.toPromise());
            this.isCaptain = player.isCaptain;
            this.parseTeam(team);
          }
          this.isLoaderShown = false;
        },
        error: () => {
          this.isLoaderShown = false;
          this.snackbarService.displayError();
        }
      })
  }

  parseTeam(resp: Partial<TeamAllInfo>) {
    if (resp) {
      // Player has team
      this.team = resp;

      this.shortcuts = JSON.parse(JSON.stringify(this.actionShortcutDataRow_Team_Member));
    } else {
      this.shortcuts = JSON.parse(JSON.stringify(this.actionShortcutDataRow_No_Team_Member));
    }
    this.createTeamStatistics();
  }

  selectAction(action: IActionShortcutData) {
    if (action.route && !action.disabled) {
      this.router.navigate([action.route])
    }
  }

  createTeamStatistics() {
    this.teamStats = [];
    this.teamStats.push({ icon: 'sports_soccer', label: 'Goals', value: this.team?.g || 0 });
    this.teamStats.push({ icon: 'flag', label: 'Wins', value: this.team?.w || 0 });
    this.teamStats.push({ icon: 'cancel_presentation', label: 'Losses', value: this.team?.l || 0 });
    this.teamStats.push({ icon: 'sports_soccer', label: 'Matches', value: (this.team?.fkc_played + this.team?.fcp_played + this.team?.fpl_played) || 0, });
    this.teamStats.push({ icon: 'style', label: 'Cards', value: this.team?.rcards || 0, iconClass: 'red' });
    this.teamStats.push({ icon: 'style', label: 'Cards', value: this.team?.ycards || 0, iconClass: 'yellow' });
    this.teamStats.push({ icon: 'sports_handball', label: 'Conceded', value: this.team?.g_conceded || 0, });
  }
}

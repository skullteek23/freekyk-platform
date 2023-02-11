import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { IActionShortcutData } from '@shared/components/action-shortcut-button/action-shortcut-button.component';
import { MAXIMUM_VALUE, OnboardingStepsTrackerService } from '@app/services/onboarding-steps-tracker.service';
import { PlayerService } from '@app/services/player.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { Store } from '@ngrx/store';
import { PlayerCardComponent } from '@shared/dialogs/player-card/player-card.component';
import { MatchFixture, ParseMatchProperties } from '@shared/interfaces/match.model';
import { Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { TeamService } from 'src/app/services/team.service';
import { TeamState } from '../dash-team-manag/store/team.reducer';
import { DashState } from '../store/dash.reducer';
import { IMyMatchesData } from './my-matches/my-matches.component';
import { IStatisticsCard } from './my-stats-card/my-stats-card.component';

@Component({
  selector: 'app-dash-home',
  templateUrl: './dash-home.component.html',
  styleUrls: ['./dash-home.component.scss'],
})
export class DashHomeComponent implements OnInit, OnDestroy {
  @ViewChild(MatTabGroup) tabs: MatTabGroup;

  isLoaderShown = false;
  subscriptions = new Subscription();
  profileProgress: number = 0;
  profileShortcutData: IActionShortcutData;
  teamShortcutData: IActionShortcutData;
  ticketShortcutData: IActionShortcutData;
  upcomingFixture: MatchFixture;
  upcomingFixtureDescription: string;
  userMatchesData: IMyMatchesData = new IMyMatchesData();
  team: string;
  teamMatches: MatchFixture[] = [];
  playerName = 'User';
  stats: IStatisticsCard[] = [];

  constructor(
    private teamService: TeamService,
    private store: Store<{ dash: DashState; team: TeamState; }>,
    private onboardingStepsTrackerService: OnboardingStepsTrackerService,
    private dialog: MatDialog,
    private ngFire: AngularFirestore,
    private snackbarService: SnackbarService,
    private router: Router,
    private playerService: PlayerService
  ) { }

  ngOnInit(): void {
    this.createShortcutButtonData();
    this.getTeamFixtures();
    this.getPlayerName();
    this.getStats();
    this.getOnboardingProgress();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getOnboardingProgress() {
    this.subscriptions.add(this.onboardingStepsTrackerService._progress.subscribe(response => {
      this.profileProgress = response;
      const label = `${this.profileProgress}% Done`;
      this.profileShortcutData = {
        actionLabel: 'My Profile',
        secondaryLabel: this.profileProgress === MAXIMUM_VALUE ? null : label,
        secondaryIcon: 'check_circle',
        icon: 'account_circle',
      };
    }));

  }

  createShortcutButtonData() {
    this.teamShortcutData = {
      actionLabel: 'My Team',
      icon: 'groups',
    };
    this.ticketShortcutData = {
      actionLabel: 'Need help? Raise a ticket',
      icon: 'help'
    }
  }

  getTeamFixtures() {
    this.store.select('team').pipe(take(1))
      .subscribe({
        next: (response) => {
          if (response) {
            const data = response[0];
            if (data?.upcomingMatches) {
              const matchCopy = JSON.parse(JSON.stringify(data.upcomingMatches[0]));
              this.upcomingFixture = matchCopy;
              this.upcomingFixture.status = ParseMatchProperties.getTimeDrivenStatus(matchCopy.status, matchCopy.date);
              this.upcomingFixtureDescription = ParseMatchProperties.getStatusDescription(this.upcomingFixture.status);
            } else {
              this.upcomingFixture = null;
            }
            if (data?.basicInfo?.tname) {
              this.userMatchesData.team = data.basicInfo.tname;
              this.ngFire.collection('allMatches', (query) => query.where('teams', 'array-contains', data?.basicInfo?.tname))
                .get()
                .pipe(
                  map((resp) => resp.docs.map((doc) => ({ id: doc.id, ...(doc.data() as MatchFixture) } as MatchFixture)))
                )
                .subscribe(response => {
                  this.teamMatches = response?.length ? response : [];
                })
            }
          }
        },
        error: (error) => this.snackbarService.displayError('Error getting fixtures')
      })
  }

  getPlayerName() {
    this.store.select('dash').pipe(take(1))
      .subscribe(response => {
        this.playerName = response?.playerBasicInfo?.name || 'New User'
      })
  }

  getStats() {
    const uid = localStorage.getItem('uid');
    if (uid) {
      this.playerService.fetchPlayerStats(uid).pipe(
        map((stats) => {
          let newArray: IStatisticsCard[] = [];
          newArray = [
            {
              icon: 'sports_soccer',
              label: 'Apps',
              value: stats.apps,
            },
            { icon: 'sports_soccer', label: 'Goals', value: stats.g },
            { icon: 'flag', label: 'Wins', value: stats.w },
            { icon: 'style', label: 'Cards', value: stats.rcards, iconClass: 'red' },
            { icon: 'style', label: 'Cards', value: stats.ycards, iconClass: 'yellow' },
            { icon: 'cancel_presentation', label: 'Losses', value: stats.l },
          ];
          return newArray;
        })
      )
        .subscribe(response => {
          if (response) {
            this.stats = response;
          }
        });
    }
  }

  takeTeamAction() {
    this.store
      .select('dash')
      .pipe(
        take(1)
      )
      .subscribe(response => {
        this.playerName
        if (response?.hasTeam) {
          this.router.navigate(['/dashboard', 'team-management'])
        } else {
          this.openJoinTeam();
        }
      })
  }

  openJoinTeam() {
    this.teamService.onOpenJoinTeamDialog();
  }

  openTicketDialog() {
    this.router.navigate(['/support'])
  }

  getTeamInfo() {
    this.userMatchesData
  }

  createTeam(): void {
    this.teamService.onOpenCreateTeamDialog();
  }

  openProfile() {
    if (this.profileProgress === 75) {
      this.onboardingStepsTrackerService.onShareProfile();
    }
    const uid = localStorage.getItem('uid');
    const dialogRef = this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: uid,
    });
  }
}

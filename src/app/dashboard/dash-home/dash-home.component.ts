import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
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
import { NotificationsService } from '@app/services/notifications.service';
import { RazorPayOrder } from '@shared/interfaces/order.model';

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
  pendingOrdersList: Partial<RazorPayOrder>[] = [];
  isPendingOrder = false;

  constructor(
    private teamService: TeamService,
    private store: Store<{ dash: DashState; team: TeamState; }>,
    private onboardingStepsTrackerService: OnboardingStepsTrackerService,
    private dialog: MatDialog,
    private ngFire: AngularFirestore,
    private snackbarService: SnackbarService,
    private router: Router,
    private playerService: PlayerService,
    private notificationService: NotificationsService
  ) { }

  ngOnInit(): void {

    this.createShortcutButtonData();
    this.getTeamFixtures();
    this.getPlayerName();
    this.getStats();
    this.subscriptions.add(this.notificationService.requestAcceptLoadingStatus.subscribe((response: boolean) => {
      this.isLoaderShown = response;
    }));
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
        secondaryIcon: this.profileProgress === MAXIMUM_VALUE ? 'check_circle' : null,
        icon: 'account_circle',
      };
    }));
  }


  createShortcutButtonData() {

    this.ticketShortcutData = {
      actionLabel: 'Need help? Raise a ticket',
      icon: 'help'
    }
    this.getOnboardingProgress();
    this.getTeamStatus();
    this.getUserOrders();
  }

  getTeamStatus() {
    this.store.select('team').pipe(take(1))
      .subscribe(response => {
        if (response?.basicInfo.tname) {
          this.teamShortcutData = {
            actionLabel: 'My Team',
            icon: 'groups',
            secondaryIcon: 'check_circle'
          };
        } else {
          this.teamShortcutData = {
            actionLabel: 'Create or Join a Team',
            icon: 'add_circle',
          }
        }
      })
  }

  getTeamFixtures() {
    this.store.select('team').pipe(take(1))
      .subscribe({
        next: (response) => {
          if (response?.basicInfo?.tname !== null) {
            if (response?.upcomingMatches?.length) {
              const matchCopy = JSON.parse(JSON.stringify(response.upcomingMatches[0]));
              this.upcomingFixture = matchCopy;
              this.upcomingFixture.status = ParseMatchProperties.getTimeDrivenStatus(matchCopy.status, matchCopy.date);
              this.upcomingFixtureDescription = ParseMatchProperties.getStatusDescription(this.upcomingFixture.status);
            } else {
              this.upcomingFixture = null;
            }
            this.userMatchesData.team = response.basicInfo.tname;
            this.ngFire.collection('allMatches', (query) => query.where('teams', 'array-contains', response?.basicInfo?.tname))
              .get()
              .pipe(
                map((resp) => resp.docs.map((doc) => ({ id: doc.id, ...(doc.data() as MatchFixture) } as MatchFixture)))
              )
              .subscribe(response => {
                this.teamMatches = response?.length ? response : [];
              })
          }
        },
        error: (error) => this.snackbarService.displayError('Error getting fixtures')
      })
  }

  getUserOrders() {
    const uid = localStorage.getItem('uid');
    this.ngFire.collection('orders', (query) => query.where('receipt', '==', uid)).get()
      .subscribe({
        next: (response) => {
          this.pendingOrdersList = [];
          if (response?.docs.length) {
            response.docs.forEach(doc => {
              const docData = doc.data() as Partial<RazorPayOrder>;
              if (docData.amount_due > 0) {
                this.isPendingOrder = true;
                this.pendingOrdersList.push({ ...docData, amount_due: docData.amount_due / 100 });
              }
            })
          }
        },
        error: () => {
          this.pendingOrdersList = [];
          this.isPendingOrder = false;
        }
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

  openProfile() {
    if (this.profileProgress === 75) {
      this.onboardingStepsTrackerService.onShareProfile();
    }
    if (this.profileProgress === 25) {
      this.router.navigate(['/dashboard', 'account']);
      return;
    }
    const uid = localStorage.getItem('uid');
    const dialogRef = this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: uid,
    });
  }

  navigateToParticipate() {
    this.router.navigate(['/dashboard', 'participate']);
  }
}

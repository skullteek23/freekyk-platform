import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { IActionShortcutData } from '@app/dashboard-action-shortcut-button/dashboard-action-shortcut-button.component';
import { NotificationsService } from '@app/services/notifications.service';
import { ActionSteps, MAXIMUM_VALUE, OnboardingProgress, OnboardingStepsTrackerService } from '@app/services/onboarding-steps-tracker.service';
import { PlayerService } from '@app/services/player.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { Store } from '@ngrx/store';
import { PlayerCardComponent } from '@shared/dialogs/player-card/player-card.component';
import { MatchFixture, ParseMatchProperties } from '@shared/interfaces/match.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { forkJoin, Subscription } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
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
  isLoading = true;
  isLoaderShown = false;
  yourTeamIndex = 0;
  subscriptions = new Subscription();
  showMobile = false;
  order1: string;
  order2: string;
  order3: string;
  order4: string;
  profileProgress: number = 0;
  nextStatus: OnboardingProgress = null;
  currentStatusProfileCompletion: OnboardingProgress = null;

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
    private mediaObs: MediaObserver,
    private teamService: TeamService,
    private store: Store<{ dash: DashState; team: TeamState; }>,
    private notificationService: NotificationsService,
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




    // this.subscriptions.add(this.notificationService.requestAcceptLoadingStatus.subscribe((response: boolean) => {
    //   this.isLoaderShown = response;
    // }));
    // this.subscriptions.add(this.onboardingStepsTrackerService._progress.subscribe(response => {
    //   this.profileProgress = response;
    //   this.currentStatusProfileCompletion = this.onboardingStepsTrackerService.getProgressStepInfo(response);
    //   this.nextStatus = this.onboardingStepsTrackerService.getNextGoal(response);
    //   if (response === MAXIMUM_VALUE) {
    //     this.moveToBottom();
    //   } else {
    //     this.moveToTop();
    //   }
    // }
    // ))
    // this.subscriptions.add(
    //   this.mediaObs
    //     .asObservable()
    //     .pipe(
    //       filter((changes: MediaChange[]) => changes.length > 0),
    //       map((changes: MediaChange[]) => changes[0])
    //     )
    //     .subscribe((change: MediaChange) => {
    //       if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
    //         this.showMobile = true;
    //       } else {
    //         this.showMobile = false;
    //       }
    //       this.isLoading = false;
    //     })
    // );
    // this.subscriptions.add(
    //   this.store
    //     .select('dash')
    //     .pipe(map((resp) => resp.hasTeam))
    //     .subscribe((hasTeam) => (this.yourTeamIndex = hasTeam ? 1 : 0))
    // );
    // this.moveToTop();
  }

  createShortcutButtonData() {
    this.profileShortcutData = {
      actionLabel: 'My Profile',
      secondaryLabel: '20% Done',
      icon: 'account_circle',
      // imgUrl: 'https://firebasestorage.googleapis.com/v0/b/freekyk-prod.appspot.com/o/profileImages%2Fprofileimage_1V1dzMjbDHYdlLflydnbokv99ps1?alt=media&token=f1529062-80ba-4761-ae5d-4146ebbf67af',
    };
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

  // getTeamFixtures(name: string) {
  //   this.ngFire.collection('allMatches').get()
  //     .subscribe({
  //       next: (response) => {
  //         if (!response.empty) {
  //           const matches = response.docs.map(el => ({ id: el.id, ...el.data() as MatchFixture }))
  //           const teamMatches = matches.filter(el => el.teams.includes(name));
  //           const allMatches = [];
  //         }
  //       }
  //     });
  // }

  getTeamInfo() {
    this.userMatchesData
  }

  takeAction(action: ActionSteps) {
    this.onboardingStepsTrackerService.takeAction(action);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  moveToBottom(): void {
    this.order1 = '1';
    this.order2 = '3';
    this.order3 = '0';
    this.order4 = '2';
  }
  moveToTop(): void {
    this.order1 = '0';
    this.order2 = '1';
    this.order3 = '2';
    this.order4 = '3';
  }
  joinTeam(): void {
    this.teamService.onOpenJoinTeamDialog();
  }
  createTeam(): void {
    this.teamService.onOpenCreateTeamDialog();
  }

  openProfile() {
    const uid = localStorage.getItem('uid');
    const dialogRef = this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: uid,
    });
  }

  onAction() {
    console.log('Action triggered')
  }
}

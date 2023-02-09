import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { MatTabGroup } from '@angular/material/tabs';
import { NotificationsService } from '@app/services/notifications.service';
import { ActionSteps, MAXIMUM_VALUE, OnboardingProgress, OnboardingStepsTrackerService } from '@app/services/onboarding-steps-tracker.service';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { TeamService } from 'src/app/services/team.service';
import { DashState } from '../store/dash.reducer';

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

  constructor(
    private mediaObs: MediaObserver,
    private teamService: TeamService,
    private store: Store<{ dash: DashState; }>,
    private notificationService: NotificationsService,
    private onboardingStepsTrackerService: OnboardingStepsTrackerService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.notificationService.requestAcceptLoadingStatus.subscribe((response: boolean) => {
      this.isLoaderShown = response;
    }));
    this.subscriptions.add(this.onboardingStepsTrackerService._progress.subscribe(response => {
      this.profileProgress = response;
      this.currentStatusProfileCompletion = this.onboardingStepsTrackerService.getProgressStepInfo(response);
      this.nextStatus = this.onboardingStepsTrackerService.getNextGoal(response);
      if (response === MAXIMUM_VALUE) {
        this.moveToBottom();
      } else {
        this.moveToTop();
      }
    }
    ))
    this.subscriptions.add(
      this.mediaObs
        .asObservable()
        .pipe(
          filter((changes: MediaChange[]) => changes.length > 0),
          map((changes: MediaChange[]) => changes[0])
        )
        .subscribe((change: MediaChange) => {
          if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
            this.showMobile = true;
          } else {
            this.showMobile = false;
          }
          this.isLoading = false;
        })
    );
    this.subscriptions.add(
      this.store
        .select('dash')
        .pipe(map((resp) => resp.hasTeam))
        .subscribe((hasTeam) => (this.yourTeamIndex = hasTeam ? 1 : 0))
    );
    this.moveToTop();
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
}

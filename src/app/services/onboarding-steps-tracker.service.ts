import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UploadphotoComponent } from '@app/dashboard/dialogs/uploadphoto/uploadphoto.component';
import { DashState } from '@app/dashboard/store/dash.reducer';
import { Store } from '@ngrx/store';
import { BehaviorSubject, } from 'rxjs';

export interface OnboardingProgress {
  icon: string;
  text: string;
  targetValue: number;
  action: ActionSteps
}

export enum ActionSteps {
  photo = 0,
  profile = 1,
  team = 2,
  share = 3
}

export const ProfileCompletionSteps: OnboardingProgress[] = [
  { text: 'Setup Account', icon: 'check_circle', targetValue: 20, action: null },
  { text: 'Upload your profile photo', icon: 'check_circle', targetValue: 40, action: ActionSteps.photo },
  { text: 'Complete your profile', icon: 'check_circle', targetValue: 60, action: ActionSteps.profile },
  { text: 'Join or create a team', icon: 'check_circle', targetValue: 80, action: ActionSteps.team },
  { text: 'Share your Profile', icon: 'check_circle', targetValue: 100, action: ActionSteps.share },
]
export const MINIMUM_VALUE = 20;
export const MAXIMUM_VALUE = 100;

@Injectable({
  providedIn: 'root'
})
export class OnboardingStepsTrackerService {

  private progress: number = MINIMUM_VALUE;
  private INCREMENT_VALUE = 20;

  private progressUpdate = new BehaviorSubject<number>(0);

  constructor(
    private store: Store<{ dash: DashState }>,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.setProgress();
  }

  private setProgress() {
    this.store.select('dash')
      .subscribe({
        next: (response) => {
          if (response) {
            this.resetProgress();
            if (this.isPhotoUploaded(response)) {
              this.incrementProgress();
            }
            if (this.isProfileCompleted(response)) {
              this.incrementProgress();
            }
            if (this.isTeamAssociated(response)) {
              this.incrementProgress();
            }
            if (this.isProfileShared()) {
              this.incrementProgress();
            }
            if (this.progress > 100) {
              this.limitProgress();;
            }
            this.updateProgress()
          }
        },
        error: (error) => {
          this.resetProgress();
        }
      })
  }

  private updateProgress() {
    this.progressUpdate.next(this.progress);
  }

  private isPhotoUploaded(response: DashState) {
    return response?.playerBasicInfo?.imgpath_sm;
  }

  private isProfileCompleted(response: DashState) {
    return response?.playerBasicInfo.pl_pos || response.playerMoreInfo.born;
  }

  private isTeamAssociated(response: DashState) {
    return response?.playerBasicInfo.team !== null;
  }

  private isProfileShared() {
    const uid = localStorage.getItem('uid');
    const shareStatus = JSON.parse(localStorage.getItem(uid));
    return uid && shareStatus?.isProfileShared;
  }

  private limitProgress() {
    this.progress = MAXIMUM_VALUE;
  }

  private resetProgress() {
    this.progress = MINIMUM_VALUE;
  }

  private incrementProgress() {
    this.progress += this.INCREMENT_VALUE;
  }

  get _progress() {
    return this.progressUpdate;
  }

  getProgressStepInfo(progress: number): OnboardingProgress {
    return ProfileCompletionSteps.find(el => el.targetValue === progress);
  }

  getNextGoal(progress: number): OnboardingProgress {
    const index = ProfileCompletionSteps.findIndex(el => el.targetValue === progress);
    return ProfileCompletionSteps[index + 1] ? ProfileCompletionSteps[index + 1] : null;
  }

  takeAction(action: ActionSteps) {
    switch (action) {
      case ActionSteps.photo:
        return this.dialog
          .open(UploadphotoComponent, {
            panelClass: 'large-dialogs',
          })
          .afterClosed()
          .subscribe((response) => {
            if (response) {
              location.reload()
            }
          });

      case ActionSteps.profile:
        this.router.navigate(['/dashboard', 'account', 'profile']);
        return;
      case ActionSteps.share:
        return this.onShareProfile();

      case ActionSteps.team:
        this.router.navigate(['/dashboard', 'team-management']);
        return;

      default:
        break;
    }
  }

  onShareProfile(): void {
    const uid = localStorage.getItem('uid');
    if (!this.isProfileShared()) {
      localStorage.setItem(uid, JSON.stringify({ isProfileShared: true }));
    }
    this.router.navigate(['/play/players', uid]);
  }


}

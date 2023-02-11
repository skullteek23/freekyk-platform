import { Injectable } from '@angular/core';
import { DashState } from '@app/dashboard/store/dash.reducer';
import { Store } from '@ngrx/store';
import { BehaviorSubject, } from 'rxjs';

export const MINIMUM_VALUE = 25;
export const INCREMENT_VALUE = 25;
export const MAXIMUM_VALUE = 100;

@Injectable({
  providedIn: 'root'
})
export class OnboardingStepsTrackerService {

  private progress: number = MINIMUM_VALUE;
  private INCREMENT_VALUE = INCREMENT_VALUE;

  private progressUpdate = new BehaviorSubject<number>(0);

  constructor(
    private store: Store<{ dash: DashState }>
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

  onShareProfile(): void {
    const uid = localStorage.getItem('uid');
    if (!this.isProfileShared()) {
      localStorage.setItem(uid, JSON.stringify({ isProfileShared: true }));
    }
    this.setProgress();
  }

  get _progress() {
    return this.progressUpdate;
  }


}

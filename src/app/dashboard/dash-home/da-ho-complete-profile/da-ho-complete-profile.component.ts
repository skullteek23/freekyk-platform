import { Component, OnInit } from '@angular/core';
import { ActionSteps, OnboardingStepsTrackerService, ProfileCompletionSteps } from '@app/services/onboarding-steps-tracker.service';
@Component({
  selector: 'app-da-ho-complete-profile',
  templateUrl: './da-ho-complete-profile.component.html',
  styleUrls: ['./da-ho-complete-profile.component.scss'],
})
export class DaHoCompleteProfileComponent implements OnInit {

  profileProgress: number = 0;
  isLoading = false;

  readonly STEPS = ProfileCompletionSteps;

  constructor(
    private onboardingStepsTrackerService: OnboardingStepsTrackerService
  ) { }

  ngOnInit(): void {
    this.onboardingStepsTrackerService._progress.subscribe(response => {
      if (response) {
        this.profileProgress = response;
      }
    })
  }

  onTapAction(action: ActionSteps) {
    this.onboardingStepsTrackerService.takeAction(action);
  }
}

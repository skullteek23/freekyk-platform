import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { GenerateRewardService } from '@app/main-shell/services/generate-reward.service';
import { AuthService, authUserMain } from '@app/services/auth.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { formsMessages } from '@shared/constants/messages';
import { IMatchRequest } from '@shared/interfaces/match.model';
import { RewardableActivities } from '@shared/interfaces/reward.model';
import { ApiPostService } from '@shared/services/api.service';
import { LocationService } from '@shared/services/location-cities.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-submit-match-request',
  templateUrl: './submit-match-request.component.html',
  styleUrls: ['./submit-match-request.component.scss']
})
export class SubmitMatchRequestComponent implements OnInit {

  readonly messages = formsMessages;

  requestForm: FormGroup;
  showError = false;
  showCompletion = false;
  user: authUserMain = null;
  countries$: Observable<string[]>;
  cities$: Observable<string[]>;
  states$: Observable<string[]>;

  constructor(
    public dialogRef: MatDialogRef<SubmitMatchRequestComponent>,
    private snackbarService: SnackbarService,
    private locationService: LocationService,
    private generateRewardService: GenerateRewardService,
    private authService: AuthService,
    private apiPostService: ApiPostService
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
        }
        this.initForm();
        this.getCountries();
      }
    })
  }

  initForm() {
    this.requestForm = new FormGroup({
      matches: new FormControl(null, [Validators.required]),
      perTeamPlayers: new FormControl(null, [Validators.required]),
      location: new FormGroup({
        country: new FormControl(null, Validators.required),
        state: new FormControl(null, Validators.required),
        city: new FormControl(null, Validators.required),
      }),
      ground: new FormControl(null, [Validators.required]),
      budget: new FormControl(null, [Validators.required]),
      contactNo: new FormControl(this.user.phoneNumber, [Validators.required]),
      name: new FormControl(this.user.displayName, [Validators.required]),
    })
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  getCountries() {
    this.countries$ = this.locationService.getCountry();
  }

  onSelectCountry(country: string): void {
    this.states$ = this.locationService.getStateByCountry(country);
  }

  onSelectState(state: string): void {
    this.cities$ = this.locationService.getCityByState(state);
  }

  get locationCountry(): FormControl {
    return ((this.requestForm.get('location') as FormGroup).controls['country'] as FormControl);
  }

  get locationState(): FormControl {
    return ((this.requestForm.get('location') as FormGroup).controls['state'] as FormControl);
  }

  get locationCity(): FormControl {
    return ((this.requestForm.get('location') as FormGroup).controls['city'] as FormControl);
  }

  submit() {
    if (this.isSubmitDisabled) {
      return;
    }
    const request: IMatchRequest = {
      matches: this.requestForm.value.matches?.trim(),
      perTeamPlayers: this.requestForm.value.perTeamPlayers.trim(),
      location: {
        country: this.requestForm.value.location.country,
        state: this.requestForm.value.location.state,
        city: this.requestForm.value.location.city,
      },
      ground: this.requestForm.value.ground.trim(),
      budget: this.requestForm.value.budget.trim(),
      contactNo: Number(this.requestForm.value.contactNo),
      name: this.requestForm.value.name.trim(),
      date: new Date().getTime()
    }
    this.apiPostService.addMatchRequest(request)
      .then(() => {
        this.showCompletion = true;
        this.requestForm?.reset();
        const uid = this.authService.getUser()?.uid;
        if (uid) {
          this.generateRewardService.completeActivity(RewardableActivities.requestMatch, uid);
        }
      })
      .catch((response) => this.snackbarService.displayError())
  }

  get isSubmitDisabled(): boolean {
    return this.requestForm?.invalid || this.showCompletion;
  }
}

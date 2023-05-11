import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatVerticalStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { GenerateRewardService } from '@app/main-shell/services/generate-reward.service';
import { AuthService } from '@app/services/auth.service';
import { SnackbarService } from '@shared/services/snackbar.service';
import { ImageUploadPaths, PLAYING_POSITIONS, ProfileConstants } from '@shared/constants/constants';
import { RegexPatterns } from '@shared/constants/REGEX';
import { positionGroup } from '@shared/interfaces/others.model';
import { RewardableActivities } from '@shared/interfaces/reward.model';
import { IPlayer, authUserMain } from '@shared/interfaces/user.model';
import { ApiPostService } from '@shared/services/api.service';
import { LocationService } from '@shared/services/location-cities.service';
import { StorageApiService } from '@shared/services/storage-api.service';
import { CustomValidators } from '@shared/utils/custom-functions';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {

  readonly positions: positionGroup[] = PLAYING_POSITIONS;

  callbackUrl = null;
  isLoaderShown = false;
  nameDetailsForm: FormGroup;
  locationForm: FormGroup;
  states: string[] = [];
  cities: string[] = [];
  user: authUserMain = null;
  maxDate = new Date(ProfileConstants.MAX_BIRTH_DATE_ALLOWED);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationService,
    private authService: AuthService,
    private apiPostService: ApiPostService,
    private storageApiService: StorageApiService,
    private snackBarService: SnackbarService,
    private generateRewardService: GenerateRewardService
  ) { }

  ngOnInit(): void {
    this.initOnboarding();
  }

  initOnboarding() {
    this.initForm();
    this.getStates();
  }

  initForm() {
    this.nameDetailsForm = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaWithSpace)]),
      imgpath: new FormControl(null, Validators.required),
      gender: new FormControl(null, Validators.required),
      born: new FormControl(null, [Validators.required, CustomValidators.minSignupAge.bind(this)]),
    });
    this.locationForm = new FormGroup({
      city: new FormControl(null, Validators.required),
      state: new FormControl(null, Validators.required),
      position: new FormControl(null, Validators.required),
    })
  }

  getStates(): void {
    this.isLoaderShown = true;
    this.locationService.getStateByCountry()
      .subscribe(
        response => {
          if (response) {
            this.states = response;
          }
          this.isLoaderShown = false;
        },
        error => {
          this.isLoaderShown = false;
        }
      );
  }

  onSelectState(state: string): void {
    this.isLoaderShown = true;
    this.locationService.getCityByState(state)
      .subscribe(
        response => {
          if (response) {
            this.cities = response;
          }
          this.isLoaderShown = false;
        },
        error => {
          this.isLoaderShown = false;
        }
      );
  }

  onSelectPhoto(file: File) {
    if (this.imgpath) {
      this.imgpath.setValue(file);
    }
  }

  async submit(stepper: MatVerticalStepper): Promise<any> {
    const uid = this.authService.getUser().uid;
    if (this.locationForm.invalid || this.nameDetailsForm.invalid || !uid || !this.imgpath.value) {
      this.snackBarService.displayError('Error: Invalid details!');
      return;
    }
    const path = ImageUploadPaths.profilePhoto + `${uid}`;
    this.isLoaderShown = true;
    const url = await this.storageApiService.getPublicUrl(this.imgpath.value, path);
    if (!url) {
      this.isLoaderShown = false;
      this.snackBarService.displayError('Error: Photo upload failed!');
      return;
    }
    const playerInfo: Partial<IPlayer> = {
      name: this.nameDetailsForm.value.name,
      teamID: null,
      imgpath: url,
      isCaptain: false,
      locCity: this.locationForm.value.city,
      locState: this.locationForm.value.state,
      locCountry: 'India',
      gender: this.nameDetailsForm.value.gender,
      position: this.locationForm.value.position,
      born: new Date(this.nameDetailsForm.value.born).getTime(),
    };
    const snapshot = await this.apiPostService.addPlayer(playerInfo);
    if (!snapshot) {
      this.snackBarService.displayError('Error: Profile update failed!');
      this.isLoaderShown = false;
      return;
    }
    this.authService.updatePhoto(url);
    this.isLoaderShown = false;
    stepper.next();
  }

  navigateOut() {
    const uid = this.authService.getUser().uid;
    if (uid) {
      this.generateRewardService.completeActivity(RewardableActivities.onboarding, uid);
    }
    const queryParams = this.route.snapshot.queryParams;
    this.callbackUrl = queryParams?.hasOwnProperty('callback') ? decodeURIComponent(queryParams.callback) : '/';
    this.router.navigate([this.callbackUrl]);
  }

  get imgpath(): AbstractControl {
    return this.nameDetailsForm.get('imgpath');
  }

  get city(): FormControl {
    return this.locationForm.controls['city'] as FormControl;
  }

  get state(): FormControl {
    return this.locationForm.controls['state'] as FormControl;
  }
}

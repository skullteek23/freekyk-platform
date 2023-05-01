import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatVerticalStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { GenerateRewardService } from '@app/main-shell/services/generate-reward.service';
import { AuthService, authUserMain } from '@app/services/auth.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { ImageUploadPaths, PLAYING_POSITIONS, ProfileConstants } from '@shared/constants/constants';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { positionGroup } from '@shared/interfaces/others.model';
import { RewardableActivities } from '@shared/interfaces/reward.model';
import { IPlayer } from '@shared/interfaces/user.model';
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
    this.getStates('India');
  }

  initForm() {
    this.nameDetailsForm = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaWithSpace)]),
      imgpath: new FormControl(null, Validators.required),
      gender: new FormControl('M', Validators.required),
      born: new FormControl(null, Validators.required, CustomValidators.minSignupAge.bind(this)),
    });
    this.locationForm = new FormGroup({
      city: new FormControl(null, Validators.required),
      state: new FormControl(null, Validators.required),
      position: new FormControl(null, Validators.required),
    })
  }

  getStates(country: string): void {
    this.isLoaderShown = true;
    this.locationService.getStateByCountry(country)
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
    if (this.locationForm.valid && this.nameDetailsForm.valid) {
      const uid = this.authService.getUser().uid;
      this.isLoaderShown = true;
      const path = ImageUploadPaths.profilePhoto + `${uid}`;
      const url = await this.storageApiService.getPublicUrl(this.nameDetailsForm.value.imgpath, path);
      if (url && uid) {
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
        const allPromises = [];
        allPromises.push(this.apiPostService.setupEmptyPoints(uid, { points: 0 }));
        allPromises.push(this.apiPostService.addPlayer(playerInfo, this.nameDetailsForm.value.imgpath));
        const snapshotSuccess = await Promise.all(allPromises);
        if (snapshotSuccess) {
          this.authService.updatePhoto(url);
          this.snackBarService.displayCustomMsg('Profile updated successfully!');
          this.isLoaderShown = false;
          stepper.next();
        }
        this.isLoaderShown = false;
      }
      this.isLoaderShown = false;
    }
  }

  async navigateOut() {
    const uid = this.authService.getUser().uid;
    if (uid) {
      this.generateRewardService.addActivityPoints(RewardableActivities.onboarding, uid);
    }
    const queryParams = this.route.snapshot.queryParams;
    this.callbackUrl = queryParams.hasOwnProperty('callback') ? decodeURIComponent(queryParams.callback) : '/';
    this.router.navigate([this.callbackUrl]);
  }

  get imgpath() {
    return this.nameDetailsForm.get('imgpath');
  }

  get city() {

    return this.locationForm.controls['city'] as FormControl;
  }

  get state() {
    return this.locationForm.controls['state'] as FormControl;
  }
}

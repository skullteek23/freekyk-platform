import { P } from '@angular/cdk/keycodes';
import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatVerticalStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, authUserMain } from '@app/services/auth.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { PLAYING_POSITIONS, ProfileConstants } from '@shared/constants/constants';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { positionGroup } from '@shared/interfaces/others.model';
import { IPlayer } from '@shared/interfaces/user.model';
import { ApiGetService, ApiPostService } from '@shared/services/api.service';
import { LocationService } from '@shared/services/location-cities.service';
import { StorageApiService } from '@shared/services/storage-api.service';
import { Observable, of } from 'rxjs';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationService,
    private authService: AuthService,
    private apiGetService: ApiGetService,
    private apiPostService: ApiPostService,
    private storageApiService: StorageApiService,
    private snackBarService: SnackbarService,
    private ngAuth: AngularFireAuth,
  ) { }

  ngOnInit(): void {
    this.initOnboarding();
  }

  initOnboarding() {
    this.initForm();
    this.getStates('India');
    // this.ngAuth.onAuthStateChanged(user => {
    //   this.user = user;
    //   if (this.user.displayName && ) {
    //     this.apiGetService.getPlayerOnboardingStatus(this.user.uid).subscribe({
    //       next: (response) => {
    //         const queryParams = this.route.snapshot.queryParams;
    //         this.callbackUrl = queryParams.hasOwnProperty('callback') ? decodeURIComponent(queryParams.callback) : '/';
    //         if (response) {
    //           // If user is already onboard, navigate to callback url
    //           this.navigateOut();
    //         } else {
    //           // If user is not onboard, continue initializing component
    //         }
    //       }
    //     })
    //   } else {
    //     this.router.navigate(['/signup']);
    //   }
    // });
  }

  initForm() {
    this.nameDetailsForm = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaWithSpace)]),
      imgpath: new FormControl(null, Validators.required),
      gender: new FormControl(null, Validators.required),
      born: new FormControl(null, Validators.required, this.minimumAge.bind(this)),
    });
    this.locationForm = new FormGroup({
      city: new FormControl(null, Validators.required),
      state: new FormControl(null, Validators.required),
      position: new FormControl(null, Validators.required),
    })
  }

  minimumAge(control: AbstractControl): Observable<Date> {
    return new Date(control?.value).getTime() >=
      new Date(ProfileConstants.MAX_BIRTH_DATE_ALLOWED).getTime()
      ? of({ underAge: true })
      : of(null);
  }

  getStates(country: string): void {
    this.locationService.getStateByCountry(country)
      .subscribe(response => {
        if (response) {
          this.states = response;
        }
      });
  }

  onSelectState(state: string): void {
    this.locationService.getCityByState(state)
      .subscribe(response => {
        if (response) {
          this.cities = response;
        }
      });
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
      const path = `/profileImages/profileimage_${uid}`;
      const url = await this.storageApiService.getPublicUrl(this.nameDetailsForm.value.imgpath, path);
      if (url) {
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
        const snapshotSuccess = await this.apiPostService.addPlayer(playerInfo, this.nameDetailsForm.value.imgpath);
        if (snapshotSuccess) {
          this.snackBarService.displayCustomMsg('Profile updated successfully!');
          this.isLoaderShown = false;
          stepper.next();
        }
        this.isLoaderShown = false;
      }
      this.isLoaderShown = false;
    }
  }

  navigateOut() {
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
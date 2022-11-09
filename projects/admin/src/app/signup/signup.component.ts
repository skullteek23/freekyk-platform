import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { LocationService } from '@shared/services/location-cities.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { formsMessages } from '@shared/constants/messages';
import { CanComponentDeactivate, Guard } from '@shared/guards/can-deactivate-guard.service';
import { RegistrationRequest } from '@shared/interfaces/admin.model';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatchConstants } from '@shared/constants/constants';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  readonly messages = formsMessages;

  countries$: Observable<string[]>;
  cities$: Observable<string[]>;
  isLoaderShown = false;
  isRegistrationSent = false;
  signupForm: FormGroup;
  states$: Observable<string[]>;

  constructor(
    private locationService: LocationService,
    private ngFirestore: AngularFirestore,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getCountries();
  }

  initForm() {
    this.signupForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required]),
      contactNumber: new FormControl(null, [Validators.required]),
      location: new FormGroup({
        country: new FormControl(null, [Validators.required]),
        state: new FormControl(null, [Validators.required]),
        city: new FormControl(null, [Validators.required]),
      }),
      company: new FormControl(null),
      gst: new FormControl(null),
      selfGround: new FormControl(0, [Validators.required]),
    });
  }

  onSubmit() {
    if (this.signupForm.valid && this.signupForm.value) {
      this.isLoaderShown = true;
      const request: RegistrationRequest = {
        name: this.signupForm?.value?.name,
        email: this.signupForm?.value?.email,
        contactNumber: this.signupForm?.value?.contactNumber,
        location: {
          country: this.signupForm?.value?.location.country,
          state: this.signupForm?.value?.location.state,
          city: this.signupForm?.value?.location.city,
        },
        company: this.signupForm?.value?.company,
        gst: this.signupForm?.value?.gst,
        selfGround: this.signupForm?.value?.selfGround,
      };

      const organizerID = MatchConstants.UNIQUE_ORGANIZER_CODE + this.ngFirestore.createId().slice(0, 8);
      this.ngFirestore.collection('adminRegistrationRequests', query => query.where('email', '==', request.email))
        .get()
        .pipe(
          switchMap(resp => {
            if (resp.empty) {
              // email triggered when this document is written
              return this.ngFirestore.collection('adminRegistrationRequests').doc(organizerID).set(request);
            }
            this.snackbarService.displayError('Email already registered. Please use another email!');
            return of(null);
          })
        )
        .subscribe({
          next: (response) => {
            this.isLoaderShown = false;
            this.isRegistrationSent = true;
          },
          error: (error) => {
            this.isLoaderShown = false;
            this.snackbarService.displayError();
          },
        });
    }
  }

  getCountries() {
    this.countries$ = this.locationService.getCountry();
  }

  onSelectCountry(country: MatSelectChange): void {
    this.states$ = this.locationService.getStateByCountry(country.value);
  }

  onSelectState(state: MatSelectChange): void {
    this.cities$ = this.locationService.getCityByState(state.value);
  }

}

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

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, CanComponentDeactivate {

  readonly messages = formsMessages;

  countries$: Observable<string[]>;
  cities$: Observable<string[]>;
  isLoaderShown = false;
  isRegistrationSent = false;
  referenceID = '';
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

  canDeactivate(): Guard {
    if (this.isRegistrationSent) {
      const response = window.confirm('Are you sure you want to exit? (Reference ID will be lost!)').valueOf();
      return response;
    }
    return true;
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

      this.referenceID = this.ngFirestore.createId();
      this.ngFirestore.collection('adminRegistrationRequests', query => query.where('email', '==', request.email))
        .get()
        .pipe(
          switchMap(resp => {
            if (resp.empty) {
              return this.ngFirestore.collection('adminRegistrationRequests').add(request);
            }
            this.snackbarService.displayError('Email already registered. Please use another email!');
            return of(null);
          })
        )
        .toPromise()
        .then((resp) => {
          if (resp) {
            this.isRegistrationSent = true;
            this.referenceID = resp.id;
          }
        })
        .catch(() => {
          this.snackbarService.displayError();
        })
        .finally(() => {
          this.isLoaderShown = false;
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

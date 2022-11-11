import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { LocationService } from '@shared/services/location-cities.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { formsMessages } from '@shared/constants/messages';
import { Admin, AssignedRoles } from '@shared/interfaces/admin.model';
import { Observable } from 'rxjs';
import { AuthService } from '@admin/services/auth.service';

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
    private snackbarService: SnackbarService,
    private authService: AuthService
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

  async onSubmit(): Promise<any> {
    if (this.signupForm.valid && this.signupForm.value) {
      this.isLoaderShown = true;
      const email = this.email?.value;
      const isEmailUnique = (await this.ngFirestore
        .collection('admins', query => query.where('email', '==', email))
        .get()
        .toPromise())
        .empty;
      if (isEmailUnique && email) {
        const passKey = this.ngFirestore.createId().slice(0, 10);
        this.authService.registerUser(email, passKey)
          .then((user) => {
            if (user?.user?.uid) {
              const organizerID = this.authService.getOrganizerID(user.user.uid);
              const request: Admin = {
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
                status: 0,
                role: AssignedRoles.organizer,
                passKey
              };
              this.ngFirestore.collection('admins').doc(organizerID).set(request)
                .then(() => {
                  this.isLoaderShown = false;
                  this.isRegistrationSent = true;
                })
                .catch(() => {
                  this.isLoaderShown = false;
                  this.snackbarService.displayError('Unexpected error occurred!');
                });
            }
          })
          .catch((error) => {
            const errorMessage = this.authService.getErrorMessage(error.code);
            this.snackbarService.displayError(errorMessage);
          });
      } else {
        this.snackbarService.displayError('Email already registered. Please use another email!');
      }
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

  get email() {
    return this.signupForm?.get('email');
  }

}

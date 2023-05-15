import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LocationService } from '@shared/services/location-cities.service';
import { SnackbarService } from '@shared/services/snackbar.service';
import { formsMessages } from '@shared/constants/messages';
import { Admin, AssignedRoles } from '@shared/interfaces/admin.model';
import { AuthService } from '@admin/services/auth.service';
import { RegexPatterns } from '@shared/constants/REGEX';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  readonly messages = formsMessages;

  countries: string[] = [];
  states: string[] = [];
  cities: string[] = [];
  isLoaderShown = false;
  isRegistrationSent = false;
  signupForm: FormGroup;

  constructor(
    private locationService: LocationService,
    private snackbarService: SnackbarService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initForm();
    window.scrollTo(0, 0);
  }

  initForm() {
    this.signupForm = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaWithSpace)]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      contactNumber: new FormControl(null, [Validators.pattern(RegexPatterns.phoneNumber)]),
      location: new FormGroup({
        // locCountry: new FormControl('India'),
        state: new FormControl(null),
        city: new FormControl(null),
      }),
      company: new FormControl(null, [Validators.pattern(RegexPatterns.alphaNumberWithSpace), Validators.maxLength(60)]),
      gst: new FormControl(null, Validators.pattern(RegexPatterns.gstNumber)),
      selfGround: new FormControl(0, [Validators.required]),
    });
    this.onSelectCountry('India');
  }

  async onSubmit(): Promise<any> {
    if (this.signupForm.valid && this.signupForm.value) {
      this.showLoader();
      const email = this.email?.value;
      if (email) {
        const request: Admin = {
          name: this.signupForm?.value?.name.trim(),
          email: email.trim(),
          contactNumber: this.signupForm?.value?.contactNumber,
          location: {
            country: 'India',
            state: this.signupForm?.value?.location.state,
            city: this.signupForm?.value?.location.city,
          },
          company: this.signupForm?.value?.company,
          gst: this.signupForm?.value?.gst,
          selfGround: this.signupForm?.value?.selfGround,
          status: 0,
          role: AssignedRoles.organizer,
        };
        this.authService.registerUserByEmail(request)
          .then(() => {
            this.hideLoader();
            window.scrollTo(0, 0);
            this.isRegistrationSent = true;
          })
          .catch((error) => {
            this.hideLoader();
            window.scrollTo(0, 0);
            this.snackbarService.displayError(error?.message);
          });
      }
    }
  }

  onSelectCountry(country: string): void {
    this.showLoader();
    this.locationService.getStateByCountry(country)
      .subscribe(response => {
        if (response) {
          this.states = response;
        }
        this.hideLoader();
      });
  }

  onSelectState(state: string): void {
    this.showLoader();
    this.locationService.getCityByState(state)
      .subscribe(response => {
        if (response) {
          this.cities = response;
        }
        this.hideLoader();
      });
  }

  get locationCountry(): FormControl {
    return ((this.signupForm.get('location') as FormGroup)?.controls['country'] as FormControl);
  }

  get locationState(): FormControl {
    return ((this.signupForm.get('location') as FormGroup)?.controls['state'] as FormControl);
  }

  get locationCity(): FormControl {
    return ((this.signupForm.get('location') as FormGroup)?.controls['city'] as FormControl);
  }

  get email() {
    return this.signupForm?.get('email');
  }

  showLoader() {
    this.isLoaderShown = true;
  }

  hideLoader() {
    this.isLoaderShown = false;
  }
}

import { AuthService } from '@admin/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SnackbarService } from '@app/services/snackbar.service';
import { formsMessages } from '@shared/constants/messages';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { Admin } from '@shared/interfaces/admin.model';
import { LocationService } from '@shared/services/location-cities.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-my-account-panel',
  templateUrl: './my-account-panel.component.html',
  styleUrls: ['./my-account-panel.component.scss']
})
export class MyAccountPanelComponent implements OnInit {

  readonly messages = formsMessages;

  countries$: Observable<string[]>;
  cities$: Observable<string[]>;
  personalInfoForm: FormGroup;
  isLoaderShown = false;
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
    this.getOrganizerDetails();
  }

  initForm() {
    this.personalInfoForm = new FormGroup({
      id: new FormControl(null),
      company: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaNumberWithSpace)]),
      managedBy: new FormControl(null, Validators.pattern(RegexPatterns.alphaNumberWithSpace)),
      contactNumber: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.phoneNumber)]),
      altContactNumber: new FormControl(null, Validators.pattern(RegexPatterns.phoneNumber)),
      location: new FormGroup({
        country: new FormControl(null),
        state: new FormControl(null),
        city: new FormControl(null),
      }),
      gst: new FormControl(null),
      website: new FormControl(null, Validators.pattern(RegexPatterns.website)),
      selfGround: new FormControl(0, [Validators.required]),
    });
  }

  getOrganizerDetails() {
    const orgID = this.authService.getUID();
    if (orgID) {
      this.isLoaderShown = true;
      this.ngFirestore.collection('admins').doc(orgID).get().subscribe({
        next: (response) => {
          if (response.exists) {
            const adminData = { id: response.id, ...response.data() as Admin };
            const country = adminData.location.country;
            const state = adminData.location.state;
            const city = adminData.location.city;
            if (country && state && city) {
              this.onSelectCountry(country);
              this.onSelectState(state);
            }
            this.personalInfoForm.patchValue({
              ...adminData
            });
            this.disableControls();
            this.isLoaderShown = false;
          }
        },
        error: () => {
          this.isLoaderShown = false;
        }
      });
    }
  }

  disableControls() {
    this.personalInfoForm.get('id').disable();
    this.personalInfoForm.get('location').disable();
  }

  onSubmit() {
    if (this.personalInfoForm.valid && this.personalInfoForm.value) {
      const updatedValues: Partial<Admin> = {};
      for (const key in this.personalInfoForm.controls) {
        if (this.personalInfoForm.valid) {
          const control = this.personalInfoForm.controls[key];
          if (control && control.valid && control.dirty && control.value) {
            const controlValue = control?.value;
            updatedValues[key] = controlValue;
          }
        }
      }
      const organizerID = this.personalInfoForm.get('id').value;
      if (organizerID && Object.keys(updatedValues).length) {
        this.isLoaderShown = true;
        this.ngFirestore.collection('admins').doc(organizerID).update(updatedValues)
          .then(() => {
            this.personalInfoForm.reset();
            this.getOrganizerDetails();
          })
          .catch(() => {
            this.snackbarService.displayError('Update Failed!');
            this.isLoaderShown = false;
          });
      }
    }
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

  get company() {
    return this.personalInfoForm?.get('company');
  }

  get website() {
    return this.personalInfoForm?.get('website');
  }

  get managedBy() {
    return this.personalInfoForm?.get('managedBy');
  }

  get altContactNumber() {
    return this.personalInfoForm?.get('altContactNumber');
  }

  get contactNumber() {
    return this.personalInfoForm?.get('contactNumber');
  }

}

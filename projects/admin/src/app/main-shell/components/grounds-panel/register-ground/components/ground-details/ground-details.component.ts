import { GroundAdminService } from '@admin/main-shell/services/ground-admin.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SnackbarService } from '@app/services/snackbar.service';
import { MatchConstants, MatchConstantsSecondary } from '@shared/constants/constants';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { GroundBasicInfo, GroundPrivateInfo, IGroundDetails } from '@shared/interfaces/ground.model';
import { LocationService } from '@shared/services/location-cities.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-ground-details',
  templateUrl: './ground-details.component.html',
  styleUrls: ['./ground-details.component.scss']
})
export class GroundDetailsComponent implements OnInit {

  readonly defaultCountry = 'India';

  cities$: Observable<string[]>;
  groundTypes = ['public', 'private'];
  groundDetailsForm: FormGroup = new FormGroup({});
  hours: number[] = MatchConstants.GROUND_HOURS;
  states$: Observable<string[]>;

  constructor(
    private groundAdminService: GroundAdminService,
    private locationService: LocationService
  ) { }

  ngOnInit(): void {
    this.getStates();
    this.initForm();
    this.getLastSavedData();
  }

  initForm(): void {
    this.groundDetailsForm = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaNumberWithSpace), Validators.maxLength(50)]),
      type: new FormControl(null, Validators.required),
      location: new FormGroup({
        city: new FormControl(null, Validators.required),
        state: new FormControl(null, Validators.required),
      }),
      contract: new FormGroup({
        start: new FormControl(null, Validators.required),
        end: new FormControl(null, Validators.required)
      }),
    });
  }

  getLastSavedData(): void {
    const detailsFormData: IGroundDetails = JSON.parse(sessionStorage.getItem('groundDetails'));
    if (detailsFormData) {
      this.groundDetailsForm?.patchValue({ ...detailsFormData });
      if (detailsFormData.hasOwnProperty('location')) {
        this.onSelectState(detailsFormData?.location?.state);
      }
    }
  }

  getStates() {
    this.states$ = this.locationService.getStateByCountry(this.defaultCountry);
  }

  onSelectState(state: string): void {
    if (!state) {
      return;
    }
    this.cities$ = this.locationService.getCityByState(state);
  }

  selectPhoto($event: File) {
    this.groundAdminService._selectedImageFile = $event;
  }

  selectContract($event: File) {
    this.groundAdminService._selectedImageFile = $event;
  }

  get contract(): FormGroup {
    return this.groundDetailsForm.get('contract') as FormGroup;
  }
}

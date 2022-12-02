import { GroundAdminService } from '@admin/main-shell/services/ground-admin.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { IGroundDetails, ownershipTypes, playLevels, turfTypes } from '@shared/interfaces/ground.model';
import { ListOption } from '@shared/interfaces/others.model';
import { LocationService } from '@shared/services/location-cities.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-ground-details',
  templateUrl: './ground-details.component.html',
  styleUrls: ['./ground-details.component.scss']
})
export class GroundDetailsComponent implements OnInit {

  readonly defaultCountry = 'India';
  readonly YES_OR_NO_OPTIONS: ListOption[] = [
    { value: true, viewValue: 'Yes' },
    { value: false, viewValue: 'No' }
  ]
  readonly fieldTypes = turfTypes;
  readonly playLevels = playLevels;
  readonly groundTypes = ownershipTypes;


  cities$: Observable<string[]>;
  groundDetailsForm: FormGroup = new FormGroup({});
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
      playLvl: new FormControl(null, Validators.required),
      fieldType: new FormControl(null, Validators.required),
      referee: new FormControl(null, Validators.required),
      foodBev: new FormControl(null, Validators.required),
      parking: new FormControl(null, Validators.required),
      goalpost: new FormControl(null, Validators.required),
      washroom: new FormControl(null, Validators.required),
      staff: new FormControl(null, Validators.required),
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

import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatHorizontalStepper } from '@angular/material/stepper';
import { MatchConstants, MATCH_TYPES_PACKAGES } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { LocationService } from '@shared/services/location-cities.service';
import { Observable } from 'rxjs';
import { ISelectMatchType } from '../../create-season.component';

@Component({
  selector: 'app-select-match-type',
  templateUrl: './select-match-type.component.html',
  styleUrls: ['./select-match-type.component.scss']
})
export class SelectMatchTypeComponent implements OnInit {

  @Input() stepper: MatHorizontalStepper;

  readonly messages = formsMessages;
  readonly matchPackages = [
    { value: MATCH_TYPES_PACKAGES.PackageOne, chipText: 'Most Popular' },
    { value: MATCH_TYPES_PACKAGES.PackageTwo, chipText: '' },
    { value: MATCH_TYPES_PACKAGES.PackageThree, chipText: '' },
    { value: MATCH_TYPES_PACKAGES.PackageCustom, chipText: 'Custom' }
  ];
  readonly oneDayInMilliseconds = 86400000;
  readonly teamsList = MatchConstants.ALLOWED_PARTICIPATION_COUNT;


  countries$: Observable<string[]>;
  cities$: Observable<string[]>;
  matchSelectForm: FormGroup;
  minDate: Date;
  maxDate: Date;
  states$: Observable<string[]>;
  showAdditionFields = false;
  tourTypesFiltered: string[] = [];

  constructor(
    private locationService: LocationService
  ) { }

  ngOnInit(): void {
    this.setDates();
    this.getCountries();
    this.initForm();
    this.getLastSavedData();
  }

  initForm() {
    this.matchSelectForm = new FormGroup({
      package: new FormControl(MatchConstants.CREATE_TEXT, [Validators.required]),
      startDate: new FormControl(MatchConstants.CREATE_TEXT, [Validators.required]),
      location: new FormGroup({
        country: new FormControl(MatchConstants.CREATE_TEXT, [Validators.required]),
        state: new FormControl(MatchConstants.CREATE_TEXT, [Validators.required]),
        city: new FormControl(MatchConstants.CREATE_TEXT, [Validators.required]),
      }),
      participatingTeamsCount: new FormControl(null,
        [Validators.required, Validators.min(2), Validators.max(32), Validators.pattern(RegexPatterns.num)]
      ),
      containingTournaments: new FormControl(null, [Validators.required])
    });
  }

  getLastSavedData() {
    const selectMatchTypeFormData: ISelectMatchType = JSON.parse(sessionStorage.getItem('selectMatchType'));
    if (selectMatchTypeFormData) {
      this.matchSelectForm?.patchValue({
        ...selectMatchTypeFormData
      });
      if (selectMatchTypeFormData.hasOwnProperty('location')) {
        this.onSelectCountry(selectMatchTypeFormData?.location?.country);
        this.onSelectState(selectMatchTypeFormData?.location?.state);
      }
      if (selectMatchTypeFormData.hasOwnProperty('package')) {
        this.showAdditionFields = this.isPackageCustom(selectMatchTypeFormData.package);
      }
      if (selectMatchTypeFormData.hasOwnProperty('participatingTeamsCount')) {
        this.evaluateAvailableMatchType(selectMatchTypeFormData.participatingTeamsCount);
      }
    }
  }

  setDates() {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const currentTimestamp = currentDate.getTime();

    this.minDate = new Date(currentTimestamp + (MatchConstants.START_DATE_DIFF.MIN * this.oneDayInMilliseconds));
    this.maxDate = new Date(currentTimestamp + (MatchConstants.START_DATE_DIFF.MAX * this.oneDayInMilliseconds));
  }

  onRestrictTournamentTypes(event: number) {
    this.matchSelectForm.get('containingTournaments').reset();
    this.evaluateAvailableMatchType(event);
  }

  evaluateAvailableMatchType(event: number) {
    this.tourTypesFiltered = [];
    this.tourTypesFiltered.push('FCP');
    if (MatchConstants.ALLOWED_KNOCKOUT_BRACKETS.includes(event)) {
      this.tourTypesFiltered.push('FKC');
    }
    if (event > 2) {
      this.tourTypesFiltered.push('FPL');
    }
  }

  onCustomPackage(value: MATCH_TYPES_PACKAGES) {
    if (value === MATCH_TYPES_PACKAGES.PackageOne) {
      this.matchSelectForm.get('participatingTeamsCount').setValue(2);
      this.matchSelectForm.get('containingTournaments').setValue(['FCP']);
      this.showAdditionFields = false;
    } else if (value === MATCH_TYPES_PACKAGES.PackageTwo) {
      this.matchSelectForm.get('participatingTeamsCount').setValue(4);
      this.matchSelectForm.get('containingTournaments').setValue(['FKC']);
      this.showAdditionFields = false;
    } else if (value === MATCH_TYPES_PACKAGES.PackageThree) {
      this.matchSelectForm.get('participatingTeamsCount').setValue(4);
      this.matchSelectForm.get('containingTournaments').setValue(['FPL']);
      this.showAdditionFields = false;
    } else {
      this.matchSelectForm.get('participatingTeamsCount').reset();
      this.matchSelectForm.get('containingTournaments').reset();
      this.showAdditionFields = true;
    }
  }

  getCountries() {
    this.countries$ = this.locationService.getCountry();
  }

  onSelectCountry(country: string): void {
    if (!country) {
      return;
    }
    this.states$ = this.locationService.getStateByCountry(country);
  }

  onSelectState(state: string): void {
    if (!state) {
      return;
    }
    this.cities$ = this.locationService.getCityByState(state);
  }

  isPackageCustom(value: MATCH_TYPES_PACKAGES): boolean {
    return value === MATCH_TYPES_PACKAGES.PackageCustom;
  }

}

import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatchConstants, MATCH_TYPES_PACKAGES } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { TournamentTypes } from '@shared/interfaces/match.model';
import { LocationService } from '@shared/services/location-cities.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-select-match-type',
  templateUrl: './select-match-type.component.html',
  styleUrls: ['./select-match-type.component.scss']
})
export class SelectMatchTypeComponent implements OnInit {

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
        [Validators.min(2), Validators.max(32), Validators.pattern(RegexPatterns.num)]
      ),
      containingTournaments: new FormControl(null)
    });
  }

  getLastSavedData() {
    const formValue = JSON.parse(sessionStorage.getItem('selectMatchType'));
    if (formValue) {
      this.matchSelectForm?.patchValue({
        ...formValue
      });
      if (formValue.hasOwnProperty('location')) {
        this.onSelectCountry(formValue?.location?.country);
        this.onSelectState(formValue?.location?.state);
      }
      if (formValue.hasOwnProperty('package')) {
        this.showAdditionFields = this.isPackageCustom(formValue.package);
      }
      if (formValue.hasOwnProperty('participatingTeamsCount')) {
        this.evaluateAvailableMatchType(formValue.participatingTeamsCount);
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
    this.showAdditionFields = this.isPackageCustom(value);
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

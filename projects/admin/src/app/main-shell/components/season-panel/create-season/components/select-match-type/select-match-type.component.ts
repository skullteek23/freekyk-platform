import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatchConstants } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { RegexPatterns } from '@shared/constants/REGEX';
import { TournamentTypes } from '@shared/interfaces/match.model';

@Component({
  selector: 'app-select-match-type',
  templateUrl: './select-match-type.component.html',
  styleUrls: ['./select-match-type.component.scss']
})
export class SelectMatchTypeComponent implements OnInit {

  // readonly matchPackages = [
  //   { value: MATCH_TYPES_PACKAGES.PackageOne, chipText: 'Most Popular' },
  //   { value: MATCH_TYPES_PACKAGES.PackageTwo, chipText: '' },
  //   { value: MATCH_TYPES_PACKAGES.PackageThree, chipText: '' },
  //   { value: MATCH_TYPES_PACKAGES.PackageCustom, chipText: 'Custom' }
  // ];
  // readonly oneDayInMilliseconds = 86400000;
  readonly messages = formsMessages;
  readonly teamsListCache = MatchConstants.ALLOWED_PARTICIPATION_COUNT;
  readonly types = TournamentTypes;

  // countries$: Observable<string[]>;
  // cities$: Observable<string[]>;
  // states$: Observable<string[]>;
  // minDate: Date;
  // maxDate: Date;
  // tourTypesFiltered: string[] = [];
  teamsList = MatchConstants.ALLOWED_PARTICIPATION_COUNT;
  matchSelectForm: FormGroup;
  showAdditionFields = false;
  isDisabled = false;

  constructor() { }

  ngOnInit(): void {
    this.initForm();
    // this.setDates();
    // this.getCountries();
    // this.getLastSavedData();
  }

  initForm() {
    this.matchSelectForm = new FormGroup({
      // package: new FormControl(MatchConstants.CREATE_TEXT, [Validators.required]),
      // startDate: new FormControl(null, [Validators.required]),
      // location: new FormGroup({
      //   state: new FormControl(null, [Validators.required]),
      //   city: new FormControl(null, [Validators.required]),
      // }),
      type: new FormControl(null, [Validators.required]),
      participatingTeams: new FormControl(null,
        [Validators.required, Validators.min(MatchConstants.PARTICIPANTS_COUNT.MIN), Validators.max(MatchConstants.PARTICIPANTS_COUNT.MAX), Validators.pattern(RegexPatterns.num)]
      ),
    });
    this.restrictParticipatingTeams('Pickup');
  }

  restrictParticipatingTeams(value: TournamentTypes) {
    switch (value) {
      case 'FKC':
        this.teamsList = JSON.parse(JSON.stringify(this.teamsListCache));
        this.isDisabled = false;
        break;

      case 'FCP':
        this.participatingTeams.setValue(2);
        this.isDisabled = true;
        break;

      case 'FPL':
        this.teamsList = JSON.parse(JSON.stringify(this.teamsListCache));
        this.isDisabled = false;
        break;

      case 'Pickup':
        this.participatingTeams.setValue(2);
        this.isDisabled = true;
        break;

      default:
        this.teamsList = JSON.parse(JSON.stringify(this.teamsListCache));
        this.participatingTeams.enable();
        this.isDisabled = false;
        break;
    }
  }

  // getLastSavedData() {
  //   const selectMatchTypeFormData: ISelectMatchType = JSON.parse(sessionStorage.getItem('selectMatchType'));
  //   if (selectMatchTypeFormData) {
  //     this.matchSelectForm?.patchValue({
  //       ...selectMatchTypeFormData
  //     });
  //     if (selectMatchTypeFormData.hasOwnProperty('location')) {
  //       this.onSelectCountry('India');
  //       this.onSelectState(selectMatchTypeFormData?.location?.state);
  //     }
  //     if (selectMatchTypeFormData.hasOwnProperty('package')) {
  //       this.showAdditionFields = this.isPackageCustom(selectMatchTypeFormData.package);
  //     }
  //     if (selectMatchTypeFormData.hasOwnProperty('participatingTeamsCount')) {
  //       this.evaluateAvailableMatchType(selectMatchTypeFormData.participatingTeamsCount);
  //     }
  //   }
  // }

  // setDates() {
  //   const currentDate = new Date();
  //   currentDate.setHours(0, 0, 0, 0);
  //   const currentTimestamp = currentDate.getTime();

  //   this.minDate = new Date(currentTimestamp + (MatchConstants.START_DATE_DIFF.MIN * this.oneDayInMilliseconds));
  //   this.maxDate = new Date(currentTimestamp + (MatchConstants.START_DATE_DIFF.MAX * this.oneDayInMilliseconds));
  // }

  // onRestrictTournamentTypes(event: number) {
  //   this.matchSelectForm.get('type').reset();
  //   this.evaluateAvailableMatchType(event);
  // }

  // evaluateAvailableMatchType(teamCount: number) {
  //   this.tourTypesFiltered = [];
  //   this.tourTypesFiltered.push('FCP');
  //   if (MatchConstants.ALLOWED_KNOCKOUT_BRACKETS.includes(teamCount)) {
  //     this.tourTypesFiltered.push('FKC');
  //   }
  //   if (teamCount > 2) {
  //     this.tourTypesFiltered.push('FPL');
  //   }
  // }

  // onCustomPackage(value: MATCH_TYPES_PACKAGES) {
  //   if (value === MATCH_TYPES_PACKAGES.PackageOne) {
  //     this.participatingTeams.setValue(2);
  //     this.matchSelectForm.get('type').setValue('FCP');
  //     this.showAdditionFields = false;
  //   } else if (value === MATCH_TYPES_PACKAGES.PackageTwo) {
  //     this.participatingTeams.setValue(4);
  //     this.matchSelectForm.get('type').setValue('FKC');
  //     this.showAdditionFields = false;
  //   } else if (value === MATCH_TYPES_PACKAGES.PackageThree) {
  //     this.participatingTeams.setValue(4);
  //     this.matchSelectForm.get('type').setValue('FPL');
  //     this.showAdditionFields = false;
  //   } else {
  //     this.participatingTeams.reset();
  //     this.matchSelectForm.get('type').reset();
  //     this.showAdditionFields = true;
  //   }
  // }

  // getCountries() {
  //   // this.countries$ = this.locationService.getCountry();
  //   this.onSelectCountry('India');
  // }

  // onSelectCountry(country: string): void {
  //   if (!country) {
  //     return;
  //   }
  //   this.states$ = this.locationService.getStateByCountry(country);
  // }

  // onSelectState(state: string): void {
  //   if (!state) {
  //     return;
  //   }
  //   this.cities$ = this.locationService.getCityByState(state);
  // }

  // isPackageCustom(value: MATCH_TYPES_PACKAGES): boolean {
  //   return value === MATCH_TYPES_PACKAGES.PackageCustom;
  // }

  // get locationState(): FormControl {
  //   return ((this.matchSelectForm.get('location') as FormGroup).controls['state'] as FormControl);
  // }

  // get locationCity(): FormControl {
  //   return ((this.matchSelectForm.get('location') as FormGroup).controls['city'] as FormControl);
  // }

  get participatingTeams(): AbstractControl {
    return this.matchSelectForm.get('participatingTeams')
  }

}

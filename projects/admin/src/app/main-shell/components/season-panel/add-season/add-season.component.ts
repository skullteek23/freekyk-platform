import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { PhotoUploaderComponent } from '@shared/components/photo-uploader/photo-uploader.component';
import { MatchConstantsSecondary, MatchConstants } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';

@Component({
  selector: 'app-add-season',
  templateUrl: './add-season.component.html',
  styleUrls: ['./add-season.component.scss'],
})
export class AddSeasonComponent implements OnInit {

  @ViewChild(PhotoUploaderComponent) photoUploaderComponent: PhotoUploaderComponent;

  readonly seasonImageUrl: string = MatchConstantsSecondary.DEFAULT_PLACEHOLDER;
  readonly descriptionLimit = MatchConstants.LARGE_TEXT_CHARACTER_LIMIT;
  readonly rulesLimit = MatchConstants.LARGE_TEXT_CHARACTER_LIMIT;

  cities = ['Ghaziabad'];
  currentDateTemp1 = new Date();
  currentDateTemp2 = new Date();
  selectedImageFile: File = null;
  isDisableSelection = false;
  isLoading = false;
  minDate: Date;
  maxDate: Date;
  seasonData: any = {};
  seasonForm: FormGroup = new FormGroup({});
  states = ['Uttar Pradesh'];
  teamsList = MatchConstants.ALLOWED_PARTICIPATION_COUNT;
  tourTypes = MatchConstants.MATCH_TYPES;
  tourTypesFiltered = MatchConstants.MATCH_TYPES;
  messages = formsMessages;


  constructor() { }

  ngOnInit(): void {
    this.setDates();
    this.initForm();
  }

  setDates() {
    this.currentDateTemp1.setDate(this.currentDateTemp1.getDate() + MatchConstants.START_DATE_DIFF.MIN);
    this.currentDateTemp2.setDate(this.currentDateTemp2.getDate() + MatchConstants.START_DATE_DIFF.MAX);
    this.currentDateTemp1.setHours(0);
    this.currentDateTemp1.setMinutes(0);
    this.currentDateTemp1.setSeconds(0);
    this.currentDateTemp2.setHours(0);
    this.currentDateTemp2.setMinutes(0);
    this.currentDateTemp2.setSeconds(0);
    this.minDate = new Date(this.currentDateTemp1);
    this.maxDate = new Date(this.currentDateTemp2);
  }

  initForm() {
    this.seasonForm = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaNumberWithSpace), Validators.maxLength(50)]),
      city: new FormControl(null, [Validators.required]),
      state: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [
        Validators.required, Validators.pattern(RegexPatterns.bio), Validators.maxLength(this.descriptionLimit)
      ]),
      rules: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.bio), Validators.maxLength(this.rulesLimit)]),
      startDate: new FormControl(this.minDate, [Validators.required]),
      fees: new FormControl(0,
        [Validators.required, Validators.min(MatchConstants.SEASON_PRICE.MIN), Validators.max(MatchConstants.SEASON_PRICE.MAX)]
      ),
      discount: new FormControl(0, [Validators.required, Validators.max(100), Validators.min(0)]),
      participatingTeamsCount: new FormControl(2, [Validators.required]),
      containingTournaments: new FormControl(['FCP'], [Validators.required]),
    });
  }

  onChangeImage(event) {
    this.selectedImageFile = event;
  }

  onRestrictTournamentTypes(event: MatSelectChange) {
    this.tourTypesFiltered = [];
    this.seasonForm.get('containingTournaments').reset();
    this.tourTypesFiltered.push('FCP');
    if (MatchConstants.ALLOWED_KNOCKOUT_BRACKETS.includes(event.value)) {
      this.tourTypesFiltered.push('FKC');
    }
    if (event.value > 2) {
      this.tourTypesFiltered.push('FPL');
    }
  }

  get description(): AbstractControl {
    return this.seasonForm.get('description');
  }

  get rules(): AbstractControl {
    return this.seasonForm.get('rules');
  }
}

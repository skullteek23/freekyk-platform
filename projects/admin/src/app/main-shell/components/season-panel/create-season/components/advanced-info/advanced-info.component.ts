import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatchConstants } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { allowedAgeCategories } from '@shared/interfaces/team.model';

@Component({
  selector: 'app-advanced-info',
  templateUrl: './advanced-info.component.html',
  styleUrls: ['./advanced-info.component.scss']
})
export class AdvancedInfoComponent implements OnInit {

  readonly FORMATS = MatchConstants.ALLOWED_MATCH_FORMAT;
  readonly ageCategoryList = allowedAgeCategories;
  readonly descriptionLimit = MatchConstants.LARGE_TEXT_CHARACTER_LIMIT;

  advancedInfoForm: FormGroup = new FormGroup({});
  messages = formsMessages;

  readonly DEFAULT_AGE_GROUP = 99;

  constructor() { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.advancedInfoForm = new FormGroup({
      format: new FormControl(null, Validators.required),
      fees: new FormControl(null,
        [Validators.required, Validators.min(MatchConstants.SEASON_PRICE.MIN), Validators.max(MatchConstants.SEASON_PRICE.MAX)]
      ),
      ageCategory: new FormControl(this.DEFAULT_AGE_GROUP, [Validators.required]),
      description: new FormControl(null, [Validators.maxLength(this.descriptionLimit)
      ]),
      rewards: new FormControl(null)
    });
  }

  get description() {
    return this.advancedInfoForm.get('description');
  }

}

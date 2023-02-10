import { Component, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { PhotoUploaderComponent } from '@shared/components/photo-uploader/photo-uploader.component';
import { MatchConstantsSecondary, MatchConstants } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ISeasonDetails, LastParticipationDate } from '@shared/interfaces/season.model';
import { SeasonAdminService } from '../../../../../services/season-admin.service';
import { allowedAgeCategories, Formatters } from '@shared/interfaces/team.model';

@Component({
  selector: 'app-add-season',
  templateUrl: './add-season.component.html',
  styleUrls: ['./add-season.component.scss'],
})
export class AddSeasonComponent implements OnInit {

  @ViewChild(PhotoUploaderComponent) photoUploaderComponent: PhotoUploaderComponent;

  readonly descriptionLimit = MatchConstants.LARGE_TEXT_CHARACTER_LIMIT;
  readonly rulesLimit = MatchConstants.LARGE_TEXT_CHARACTER_LIMIT;
  readonly allowedParticipationDate = [
    LastParticipationDate.sameDate,
    LastParticipationDate.oneDayBefore,
    LastParticipationDate.threeDayBefore,
    LastParticipationDate.oneWeekBefore,
  ];
  readonly ageCategoryList = allowedAgeCategories;

  defaultImage: string = MatchConstantsSecondary.DEFAULT_PLACEHOLDER;
  detailsForm: FormGroup = new FormGroup({});
  messages = formsMessages;
  seasonsNamesList: string[] = [];
  formatter = Formatters;

  constructor(
    private sanitizer: DomSanitizer,
    private seasonAdminService: SeasonAdminService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getSeasons();
    this.getLastSavedData();
  }

  initForm() {
    this.detailsForm = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaNumberWithSpace), Validators.maxLength(50), this.seasonNameUnique.bind(this)]),
      description: new FormControl(null, [
        Validators.required, Validators.maxLength(this.descriptionLimit)
      ]),
      rules: new FormControl(null, [Validators.required, Validators.maxLength(this.rulesLimit)]),
      fees: new FormControl(0,
        [Validators.required, Validators.min(MatchConstants.SEASON_PRICE.MIN), Validators.max(MatchConstants.SEASON_PRICE.MAX)]
      ),
      discount: new FormControl(0, [Validators.required, Validators.max(100), Validators.min(0)]),
      lastRegistrationDate: new FormControl(null),
      ageCategory: new FormControl(null, [Validators.required])
    });
  }

  getSeasons() {
    this.seasonAdminService.getExistingSeasonNames().subscribe({
      next: (response) => {
        if (response && response.length) {
          this.seasonsNamesList = response;
        } else {
          this.seasonsNamesList = [];
        }
      }
    });
  }

  getLastSavedData() {
    const seasonDetailsFormData: ISeasonDetails = JSON.parse(sessionStorage.getItem('seasonDetails'));
    if (seasonDetailsFormData) {
      this.detailsForm?.patchValue({
        ...seasonDetailsFormData
      });
    }
  }

  sanitizeImageUrl(url: string): string {
    return this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(url) as SafeResourceUrl)
  }

  onChangeImage(file: File) {
    if (file) {
      this.seasonAdminService.setSelectedFile(file);
    }
  }

  seasonNameUnique(control: AbstractControl): { [key: string]: any } | null {
    return this.seasonsNamesList?.findIndex(val => val?.toLowerCase() === String(control?.value)?.toLowerCase()) === -1 ? null : { nameTaken: true };
  }

  get description(): AbstractControl {
    return this.detailsForm.get('description');
  }

  get rules(): AbstractControl {
    return this.detailsForm.get('rules');
  }

}

import { Component, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { PhotoUploaderComponent } from '@shared/components/photo-uploader/photo-uploader.component';
import { MatchConstantsSecondary, MatchConstants } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { ISeasonDetails } from '../../create-season.component';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-add-season',
  templateUrl: './add-season.component.html',
  styleUrls: ['./add-season.component.scss'],
})
export class AddSeasonComponent implements OnInit {

  @ViewChild(PhotoUploaderComponent) photoUploaderComponent: PhotoUploaderComponent;

  readonly descriptionLimit = MatchConstants.LARGE_TEXT_CHARACTER_LIMIT;
  readonly rulesLimit = MatchConstants.LARGE_TEXT_CHARACTER_LIMIT;

  defaultImage: string = MatchConstantsSecondary.DEFAULT_PLACEHOLDER;
  detailsForm: FormGroup = new FormGroup({});
  messages = formsMessages;

  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getLastSavedData();
  }

  initForm() {
    this.detailsForm = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaNumberWithSpace), Validators.maxLength(50)]),
      imgpath: new FormControl(this.defaultImage),
      description: new FormControl(null, [
        Validators.required, Validators.pattern(RegexPatterns.bio), Validators.maxLength(this.descriptionLimit)
      ]),
      rules: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.bio), Validators.maxLength(this.rulesLimit)]),
      fees: new FormControl(0,
        [Validators.required, Validators.min(MatchConstants.SEASON_PRICE.MIN), Validators.max(MatchConstants.SEASON_PRICE.MAX)]
      ),
      discount: new FormControl(0, [Validators.required, Validators.max(100), Validators.min(0)]),
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

  // sanitizeImageUrl(url: string): string {
  //   return this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(url) as SafeResourceUrl)
  // }

  onChangeImage(file: File) {
    if (file) {
      const url = URL.createObjectURL(file);
      this.detailsForm.get('imgpath').setValue(url);
    }
  }

  get description(): AbstractControl {
    return this.detailsForm.get('description');
  }

  get rules(): AbstractControl {
    return this.detailsForm.get('rules');
  }
}

import { Component, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { ProfileConstants, PLAYING_POSITIONS } from '@shared/constants/constants';
import { positionGroup } from '@shared/interfaces/others.model';
import { LocationService } from '@shared/services/location-cities.service';
import { CustomValidators } from '@shared/utils/custom-functions';
import { PlayerAllInfo } from '@shared/utils/pipe-functions';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  readonly BIO_MAX_LIMIT = ProfileConstants.BIO_MAX_LIMIT;
  readonly positions: positionGroup[] = PLAYING_POSITIONS;
  readonly maxDate = new Date(ProfileConstants.MAX_BIRTH_DATE_ALLOWED);

  countries: string[] = [];
  states: string[] = [];
  cities: string[] = [];
  infoForm: FormGroup;
  photoURL = null;
  isLoaderShown = false;

  @Input() set data(value: Partial<PlayerAllInfo>) {
    this.initForm(value);
    this.photoURL = value?.imgpath || null;
  };

  @Output() loader = new Subject<boolean>();

  constructor(
    private locationService: LocationService,
  ) { }

  ngOnInit(): void {
    if (!this.infoForm) {
      this.initForm(null);
    }
  }

  initForm(value: Partial<PlayerAllInfo>) {
    this.infoForm = new FormGroup({
      imgpath: new FormControl(null),
      name: new FormControl(value?.name || null, Validators.pattern(RegexPatterns.alphaWithSpace)),
      nickname: new FormControl(value?.nickname || null, Validators.pattern(RegexPatterns.alphaNumberWithSpace)),
      gender: new FormControl(value?.gender || null),
      born: new FormControl(new Date(value?.born) || null, CustomValidators.minSignupAge.bind(this)),
      strongFoot: new FormControl(value?.strongFoot || null),
      position: new FormControl(value?.position || null),
      jerseyNo: new FormControl(value?.jerseyNo > 0 ? value?.jerseyNo : null, [
        Validators.min(1), Validators.max(99), Validators.pattern(RegexPatterns.num)
      ]),
      location: new FormGroup({
        // locCountry: new FormControl('India'),
        locState: new FormControl(value?.locState || null),
        locCity: new FormControl(value?.locCity || null),
      }),
      // height: new FormControl(value?.height || null, [Validators.pattern(RegexPatterns.num), ]),
      // weight: new FormControl(value?.weight || null, [Validators.pattern(RegexPatterns.num), ]),
      bio: new FormControl(value?.bio || null, [
        Validators.maxLength(this.BIO_MAX_LIMIT), Validators.pattern(RegexPatterns.bio)
      ]),
    });

    this.onSelectCountry('India');
    if (value?.locState) {
      this.onSelectState(value?.locState);
    }
  }

  onSelectCountry(country: string): void {
    this.showLoader();
    this.locationService.getStateByCountry(country)
      .subscribe(response => {
        if (response) {
          this.states = response;
        }
        this.hideLoader();
      });
  }

  onSelectState(state: string): void {
    this.showLoader();
    this.locationService.getCityByState(state)
      .subscribe(response => {
        if (response) {
          this.cities = response;
        }
        this.hideLoader();
      });
  }

  get locationCountry(): FormControl {
    return ((this.infoForm.get('location') as FormGroup)?.controls['locCountry'] as FormControl);
  }

  get locationState(): FormControl {
    return ((this.infoForm.get('location') as FormGroup)?.controls['locState'] as FormControl);
  }

  get locationCity(): FormControl {
    return ((this.infoForm.get('location') as FormGroup)?.controls['locCity'] as FormControl);
  }

  selectPhoto(value: File) {
    if (this.infoForm) {
      this.infoForm.get('imgpath').setValue(value);
      this.infoForm.markAsDirty();
    }
  }

  showLoader() {
    this.loader.next(true);
  }

  hideLoader() {
    this.loader.next(false);
  }
}

import { Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { SeasonAbout, SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';
import { PhotoUploaderComponent } from '../../shared/components/photo-uploader/photo-uploader.component';
import { MatchConstants, MatchConstantsSecondary } from '../../shared/constants/constants';

@Component({
  selector: 'app-add-season',
  templateUrl: './add-season.component.html',
  styleUrls: ['./add-season.component.css'],
})
export class AddSeasonComponent implements OnInit {

  @Input() set data(value) {
    if (value) {
      this.setDates();
      this.seasonData = value;
      this.initForm(value);
      this.seasonImageUrl = this.seasonForm.get('imgpath').value;
      this.enterPartialLockedMode();
    }
  }
  @Input() seasonID = null;
  @Output() stepChange = new Subject();

  cities = ['Ghaziabad'];
  currentDateTemp1 = new Date();
  currentDateTemp2 = new Date();
  imgUpload$: File = null;
  isDisableSelection = false;
  isLoading = false;
  minDate: Date;
  maxDate: Date;
  seasonData: any = {};
  seasonForm: FormGroup = new FormGroup({});
  states = ['Uttar Pradesh'];
  seasonImageUrl: string = MatchConstantsSecondary.DEFAULT_PLACEHOLDER;
  teamsList = MatchConstants.ALLOWED_PARTICIPATION_COUNT;
  tourTypes = MatchConstants.MATCH_TYPES;
  tourTypesFiltered = MatchConstants.MATCH_TYPES;

  @ViewChild(PhotoUploaderComponent) photoUploaderComponent: PhotoUploaderComponent;

  constructor(
    private ngStorage: AngularFireStorage,
    private ngFire: AngularFirestore,
    private snackServ: SnackbarService,
    private router: Router,
  ) { }

  ngOnInit(): void { }

  initForm(value) {
    this.seasonForm = new FormGroup({
      name: new FormControl(value.name || null, [
        Validators.required,
        Validators.pattern('^[A-Za-z0-9 _-]*$'),
        Validators.maxLength(50),
      ]),
      imgpath: new FormControl(value.imgpath || this.seasonImageUrl),
      feesPerTeam: new FormControl(value.feesPerTeam || MatchConstants.SEASON_PRICE.MIN, [Validators.required, Validators.min(MatchConstants.SEASON_PRICE.MIN), Validators.max(MatchConstants.SEASON_PRICE.MAX)]),
      locCity: new FormControl(value.locCity || null, Validators.required),
      locState: new FormControl(value.locState || null, Validators.required),
      p_teams: new FormControl(value.p_teams || null, Validators.required),
      start_date: new FormControl(value.start_date || this.minDate, Validators.required),
      cont_tour: new FormControl(value.cont_tour || null, Validators.required),
      description: new FormControl(value.description || null, [
        Validators.required,
        Validators.maxLength(300),
      ]),
      rules: new FormControl(value.rules || null, [
        Validators.required,
        Validators.maxLength(300),
      ]),
    });
  }

  async onNext() {
    if (this.isSubmitDisabled) {
      return;
    }
    if (this.seasonID) {
      this.stepChange.next();
      return;
    }
    this.isLoading = true;
    const uploadSnap = this.imgUpload$ ? (await this.ngStorage.upload('/seasonImages/' + this.imgUpload$.name, this.imgUpload$)) : false;
    if (uploadSnap) {
      uploadSnap.ref.getDownloadURL().then((path) => {
        this.setSeasonImage(path);
        this.prepareServerData();
      });
    } else {
      this.setSeasonImage();
      this.prepareServerData();
    }
  }

  async onSaveChanges() {
    if (this.isSaveChangesDisabled) {
      return;
    }
    if (!this.seasonID) {
      return;
    }
    this.isLoading = true;
    const uploadSnap = this.imgUpload$ ? (await this.ngStorage.upload('/seasonImages/' + this.imgUpload$.name, this.imgUpload$)) : false;
    if (uploadSnap) {
      uploadSnap.ref.getDownloadURL().then((path) => {
        this.setSeasonImage(path);
        this.prepareServerData(this.seasonID);
      });
    } else {
      this.prepareServerData(this.seasonID);
    }
  }

  prepareServerData(sid?: string) {
    const newSeason: Partial<SeasonBasicInfo> = {};
    const newSeasonMore: Partial<SeasonAbout> = {};
    const seasonMoreKeys = ['description', 'rules'];
    if (sid) {
      for (const controlName in this.seasonForm.controls) {
        const control = this.seasonForm.get(controlName);
        if (control.dirty) {
          if (seasonMoreKeys.includes(controlName)) {
            newSeasonMore[controlName] = control.value;
          } else {
            newSeason[controlName] = control.value;
          }
        }
      }
      this.updateSeasonInfo(newSeason, newSeasonMore, sid);
    } else {
      for (const controlName in this.seasonForm.controls) {
        const control = this.seasonForm.get(controlName);
        if (control.dirty || (!control.dirty && control.valid)) {
          if (seasonMoreKeys.includes(controlName)) {
            newSeasonMore[controlName] = control.value;
          } else {
            newSeason[controlName] = control.value;
          }
        }
      }
      if (Object.keys(newSeason).length) {
        const id = sid ? sid : this.ngFire.createId();
        newSeason.id = id;
        newSeason.premium = true;
        newSeason.isFixturesCreated = false;
        newSeason.isSeasonEnded = false;
      }
      if (Object.keys(newSeasonMore).length) {
        newSeasonMore.paymentMethod = 'Online';
      }
      this.addSeasonInfo(newSeason, newSeasonMore, sid);
    }
  }

  addSeasonInfo(newSeason: Partial<SeasonBasicInfo>, newSeasonMore: Partial<SeasonAbout>, sid: string) {
    let allPromises: any[] = [];
    if (Object.keys(newSeason).length) {
      allPromises.push(this.ngFire.collection('seasons').doc(sid).set(newSeason));
    }
    if (Object.keys(newSeasonMore).length) {
      allPromises.push(this.ngFire.collection(`seasons/${sid}/additionalInfo`).doc('moreInfo').set(newSeasonMore));
    }
    if (allPromises.length) {
      Promise.all(allPromises)
        .then(() => {
          this.snackServ.displayCustomMsg('Info saved successfully!');
          this.reset();
          this.seasonForm.reset();
          this.stepChange.next();
        })
        .catch(() => this.snackServ.displayError());
    } else {
      this.reset();
      this.seasonForm.reset();
    }
  }

  updateSeasonInfo(newSeason: Partial<SeasonBasicInfo>, newSeasonMore: Partial<SeasonAbout>, sid: string) {
    let allPromises: any[] = [];
    if (Object.keys(newSeason).length) {
      allPromises.push(this.ngFire.collection('seasons').doc(sid).update(newSeason));
    }
    if (Object.keys(newSeasonMore).length) {
      allPromises.push(this.ngFire.collection(`seasons/${sid}/additionalInfo`).doc('moreInfo').update(newSeasonMore));
    }
    if (allPromises.length) {
      Promise.all(allPromises)
        .then(() => {
          this.snackServ.displayCustomMsg('Info updated successfully!');
          this.reset();
        })
        .catch(() => this.snackServ.displayError());
    } else {
      this.reset();
    }
  }

  reset() {
    if (this.photoUploaderComponent) {
      this.photoUploaderComponent.resetImage();
    }
    this.isLoading = false;
    this.imgUpload$ = null;
  }

  get isSubmitDisabled(): boolean {
    if (this.seasonID) {
      return false;
    }
    return this.seasonForm.invalid || !this.seasonForm.dirty
  }

  get isSaveChangesDisabled(): boolean {
    if (this.imgUpload$) {
      return false;
    }
    return this.seasonForm.invalid || !this.seasonForm.dirty;
  }

  enterPartialLockedMode() {
    if (this.seasonData.isFixtureCreated) {
      this.seasonForm.get('name').disable();
      this.seasonForm.get('locCity').disable();
      this.seasonForm.get('locState').disable();
      this.seasonForm.get('p_teams').disable();
      this.seasonForm.get('start_date').disable();
      this.seasonForm.get('cont_tour').disable();
      this.isDisableSelection = true;
    }
  }

  setSeasonImage(fileURL?: string) {
    if (this.seasonForm) {
      const validURL = fileURL || MatchConstantsSecondary.DEFAULT_IMAGE_URL;
      this.seasonForm.get('imgpath').setValue(validURL);
    }
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

  onGetImage(event) {
    this.imgUpload$ = event;
  }

  onRestrictTournamentTypes(event: MatSelectChange) {
    this.tourTypesFiltered = [];
    this.seasonForm.get('cont_tour').reset();
    this.tourTypesFiltered.push('FCP');
    if (event.value % 4 === 0) {
      this.tourTypesFiltered.push('FKC');
    }
    if (event.value > 2) {
      this.tourTypesFiltered.push('FPL');
    }
  }
}

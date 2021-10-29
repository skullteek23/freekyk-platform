import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, of, Subscription } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UpdateInfoComponent } from 'src/app/shared/components/update-info/update-info.component';
import { positionGroup } from 'src/app/shared/interfaces/others.model';
import {
  FsProfileVideos,
  PlayerMoreInfo,
  SocialMediaLinks,
} from 'src/app/shared/interfaces/user.model';
import { DashState } from '../../store/dash.reducer';
import {
  ALPHA_W_SPACE,
  ALPHA_NUM_SPACE,
  BIO,
  YOUTUBE_REGEX,
  ALPHA_LINK,
} from 'src/app/shared/Constants/REGEX';
import { PLAYING_POSITIONS } from 'src/app/shared/Constants/PLAYING_POSITIONS';
import { LocationCitiesService } from 'src/app/services/location-cities.service';
import { MatSelectChange } from '@angular/material/select';
import { BIO_MAX_LIMIT } from '../../constants/constants';
import { map } from 'rxjs/operators';
import { DeactivateAccountComponent } from '../../dialogs/deactivate-account/deactivate-account.component';
import { SOCIAL_MEDIA_PRE } from 'src/app/shared/Constants/DEFAULTS';
@Component({
  selector: 'app-acc-profile',
  templateUrl: './acc-profile.component.html',
  styleUrls: ['./acc-profile.component.css'],
})
export class AccProfileComponent implements OnInit, OnDestroy {
  readonly BIO_MAX_LIMIT = BIO_MAX_LIMIT;
  readonly ig = SOCIAL_MEDIA_PRE.ig;
  readonly fb = SOCIAL_MEDIA_PRE.fb;
  readonly tw = SOCIAL_MEDIA_PRE.tw;
  readonly yt = SOCIAL_MEDIA_PRE.yt;

  teamsArray: FormArray = new FormArray([]);
  toursArray: FormArray = new FormArray([]);
  fsVidsArray: FormArray = new FormArray([]);
  collabsArray: FormArray = new FormArray([]);
  personalInfoForm = new FormGroup({});
  playingInfoForm = new FormGroup({});
  playerArrayForm = new FormGroup({});
  fsArrayForm = new FormGroup({});
  socialInfoForm = new FormGroup({});
  filteredOptions: positionGroup[] = PLAYING_POSITIONS;
  countries$: Observable<string[]>;
  states$: Observable<string[]>;
  cities$: Observable<string[]>;
  subscriptions = new Subscription();
  emptyControlArray = new FormControl(null, [
    Validators.required,
    Validators.pattern(ALPHA_NUM_SPACE),
  ]);
  isDisableArrayButton = true;

  constructor(
    private dialog: MatDialog,
    private store: Store<{
      dash: DashState;
    }>,
    private ngFire: AngularFirestore,
    private snackServ: SnackbarService,
    private locationServ: LocationCitiesService
  ) {}
  ngOnInit(): void {
    this.initFormWithValues();
    this.countries$ = this.locationServ.getCountry();
    this.subscriptions.add(
      this.playerArrayForm
        .get('prof_teams')
        ?.valueChanges.subscribe(() => (this.isDisableArrayButton = false))
    );
    this.subscriptions.add(
      this.playerArrayForm
        .get('prof_tourns')
        ?.valueChanges.subscribe(() => (this.isDisableArrayButton = false))
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  onSelectCountry(country: MatSelectChange): void {
    this.states$ = this.locationServ.getStateByCountry(country.value);
  }
  onSelectState(state: MatSelectChange): void {
    this.cities$ = this.locationServ.getCityByState(state.value);
  }
  initFormWithValues(): void {
    const uid = localStorage.getItem('uid');
    this.initFsArrayForm();
    this.subscriptions.add(
      this.store.select('dash').subscribe((data) => {
        // for location
        if (data.playerMoreInfo.locState && data.playerMoreInfo.locCountry) {
          this.states$ = this.locationServ.getStateByCountry(
            data.playerMoreInfo.locCountry
          );
          this.cities$ = this.locationServ.getCityByState(
            data.playerMoreInfo.locState
          );
        }
        // for location

        // for player tournaments & teams
        if (
          data.playerMoreInfo.prof_teams.length !== 0 &&
          this.teamsArray.length === 0
        ) {
          this.isDisableArrayButton = false;
          data.playerMoreInfo.prof_teams.forEach((team) => {
            const newControl = new FormControl(team);
            this.teamsArray.push(newControl);
          });
          this.teamsArray.push(this.emptyControlArray);
        }
        if (
          data.playerMoreInfo.prof_tours.length !== 0 &&
          this.toursArray.length === 0
        ) {
          this.isDisableArrayButton = false;
          data.playerMoreInfo.prof_tours.forEach((tournament) => {
            const newControl = new FormControl(tournament);
            this.toursArray.push(newControl);
          });
          this.toursArray.push(this.emptyControlArray);
        }
        // for player tournaments & teams

        this.personalInfoForm = new FormGroup({
          name: new FormControl(
            data.playerBasicInfo.name,
            Validators.pattern('^[a-zA-Z ]*$')
          ),
          nickname: new FormControl(data.playerMoreInfo.nickname, [
            Validators.pattern('^[a-zA-Z ]*$'),
            Validators.required,
          ]),
          gender: new FormControl(
            data.playerBasicInfo.gen,
            Validators.required
          ),
          birthdate: new FormControl(
            data.playerMoreInfo.born ? data.playerMoreInfo.born.toDate() : null,
            Validators.required,
            this.minimumAge.bind(this)
          ),
        });
        this.playingInfoForm = new FormGroup({
          str_foot: new FormControl(
            data.playerMoreInfo.str_ft,
            Validators.required
          ),
          p_pos: new FormControl(
            data.playerBasicInfo.pl_pos,
            Validators.required
          ),
          j_num: new FormControl(data.playerBasicInfo.jer_no, [
            Validators.pattern('^[0-9]*$'),
            Validators.required,
          ]),
          loc_city: new FormControl(
            data.playerBasicInfo.locCity,
            Validators.required
          ),
          loc_state: new FormControl(
            data.playerMoreInfo.locState,
            Validators.required
          ),
          loc_country: new FormControl(
            data.playerMoreInfo.locCountry,
            Validators.required
          ),
          height: new FormControl(data.playerMoreInfo.height, [
            Validators.pattern('^[0-9]*$'),
            Validators.required,
          ]),
          weight: new FormControl(data.playerMoreInfo.weight, [
            Validators.pattern('^[0-9]*$'),
            Validators.required,
          ]),
          bio: new FormControl(data.fsInfo.bio, [
            Validators.maxLength(BIO_MAX_LIMIT),
            Validators.pattern(BIO),
          ]),
        });
        this.playerArrayForm = new FormGroup({
          prof_teams: this.teamsArray,
          prof_tourns: this.toursArray,
        });
        this.socialInfoForm = new FormGroup({
          ig: new FormControl(data.socials.ig, [
            Validators.required,
            Validators.pattern(ALPHA_LINK),
          ]),
          fb: new FormControl(data.socials.fb, [
            Validators.required,
            Validators.pattern(ALPHA_LINK),
          ]),
          yt: new FormControl(data.socials.yt, Validators.pattern(ALPHA_LINK)),
          tw: new FormControl(data.socials.tw, Validators.pattern(ALPHA_LINK)),
        });
      })
    );
  }
  initFsArrayForm(): void {
    const uid = localStorage.getItem('uid');
    // for player brand collabs & fs videos
    this.fsArrayForm = new FormGroup({
      top_vids: new FormArray([
        new FormControl(null, [
          Validators.required,
          Validators.pattern(YOUTUBE_REGEX),
        ]),
      ]),
    });
    this.ngFire
      .collection(`freestylers/${uid}/additionalInfoFs`)
      .doc('fsVideos')
      .get()
      .pipe(map((resp) => resp.data() as FsProfileVideos))
      .subscribe((videos) => {
        // for player brand collabs & fs videos
        if (videos && videos.top_vids && videos.top_vids?.length > 0) {
          videos.top_vids.forEach((video) => {
            const newControl = new FormControl(
              video,
              Validators.pattern(YOUTUBE_REGEX)
            );
            this.fsVidsArray.push(newControl);
          });
        }
        // for player brand collabs & fs videos
        if (this.fsVidsArray.length !== 0) {
          this.fsVidsArray.push(
            new FormControl(null, [
              Validators.required,
              Validators.pattern(YOUTUBE_REGEX),
            ])
          );
        }
        this.fsArrayForm = new FormGroup({
          top_vids: this.fsVidsArray,
        });
      });
  }
  onAddControl(controlName: string, formName: 'player' | 'fs'): void {
    let fmCtrl = new FormControl(null, [
      Validators.required,
      Validators.pattern(ALPHA_W_SPACE),
    ]);
    if (controlName === 'top_vids' && formName === 'fs') {
      fmCtrl = new FormControl(null, [
        Validators.required,
        Validators.pattern(YOUTUBE_REGEX),
      ]);
    }
    if (formName === 'player') {
      (this.playerArrayForm.get(controlName) as FormArray).push(fmCtrl);
    } else if (formName === 'fs') {
      (this.fsArrayForm.get(controlName) as FormArray).push(fmCtrl);
    } else {
      return;
    }
  }
  onRemoveControl(controlName: string, formName: 'player' | 'fs'): any {
    if (formName === 'player') {
      if (
        this.playerArrayForm.get(controlName).value.length === 1 &&
        !this.playerArrayForm.get(controlName).value[0]
      ) {
        this.snackServ.displayCustomMsg(`Empty fields cannot be removed!`);
      } else {
        (this.playerArrayForm.get(controlName) as FormArray).removeAt(
          (this.playerArrayForm.get(controlName) as FormArray).length - 1
        );
      }
    } else if (formName === 'fs') {
      if (
        this.fsArrayForm.get(controlName).value.length === 1 &&
        !this.fsArrayForm.get(controlName).value[0]
      ) {
        this.snackServ.displayCustomMsg(`Empty fields cannot be removed!`);
      } else {
        (this.fsArrayForm.get(controlName) as FormArray).removeAt(
          (this.fsArrayForm.get(controlName) as FormArray).length - 1
        );
      }
    } else {
      return;
    }
  }
  getFormArray(controlName: string, formName: 'player' | 'fs'): any {
    if (formName === 'player') {
      return (
        (this.playerArrayForm.get(controlName) as FormArray)?.controls || []
      );
    } else if (formName === 'fs') {
      return (this.fsArrayForm.get(controlName) as FormArray)?.controls || [];
    } else {
      return [];
    }
  }
  onSavePersonalInfo(): Promise<any> {
    if (this.personalInfoForm.dirty) {
      const newDetails: {} = {
        born: this.personalInfoForm.get('birthdate').value,
        nickname: this.personalInfoForm.get('nickname').value,
      };
      const newBasicDetails: {} = {
        gen: this.personalInfoForm.get('gender').value,
      };
      const uid = localStorage.getItem('uid');
      const allPromises = [];

      allPromises.push(
        this.ngFire
          .collection('players/' + uid + '/additionalInfo')
          .doc('otherInfo')
          .set(
            {
              ...newDetails,
            },
            { merge: true }
          )
      );
      allPromises.push(
        this.ngFire
          .collection('players')
          .doc(uid)
          .update({
            ...newBasicDetails,
          })
      );
      allPromises.push(
        this.ngFire
          .collection('freestylers')
          .doc(uid)
          .update({
            born: this.personalInfoForm.get('birthdate').value,
            nickname: this.personalInfoForm.get('nickname').value,
            gen: this.personalInfoForm.get('gender').value,
          })
      );
      return Promise.all(allPromises).then(() =>
        this.snackServ.displayCustomMsg('Updated Successfully!')
      );
    }
    this.personalInfoForm.reset();

    // backend code here
  }
  onSavePlayerInfo(): Promise<any> {
    if (this.playingInfoForm.dirty && this.playingInfoForm.valid) {
      const newDetails: PlayerMoreInfo = {
        locState: this.playingInfoForm.get('loc_state').value,
        locCountry: this.playingInfoForm.get('loc_country').value,
        height: this.playingInfoForm.get('height').value,
        weight: this.playingInfoForm.get('weight').value,
        str_ft: this.playingInfoForm.get('str_foot').value,
        bio: this.playingInfoForm.get('bio').value,
        profile: true,
      };
      const newBasicDetails: {} = {
        jer_no: this.playingInfoForm.get('j_num').value,
        locCity: this.playingInfoForm.get('loc_city').value,
        pl_pos: this.playingInfoForm.get('p_pos').value,
      };
      const newFsDetails: {} = {
        locCountry: this.playingInfoForm.get('loc_country').value,
        bio: this.playingInfoForm.get('bio').value,
      };
      console.log(newDetails);
      const uid = localStorage.getItem('uid');
      const allPromises = [];

      allPromises.push(
        this.ngFire
          .collection('players/' + uid + '/additionalInfo')
          .doc('otherInfo')
          .set(
            {
              ...newDetails,
            },
            { merge: true }
          )
      );
      allPromises.push(
        this.ngFire
          .collection('players')
          .doc(uid)
          .update({
            ...newBasicDetails,
          })
      );
      allPromises.push(
        this.ngFire
          .collection('freestylers')
          .doc(uid)
          .update({
            ...newFsDetails,
          })
      );
      return Promise.all(allPromises).then(() =>
        this.snackServ.displayCustomMsg('Updated Successfully!')
      );
    }
    this.playingInfoForm.reset();
    // backend code here
  }
  onSavePlayerArrayInfo(): Promise<any> {
    console.log(this.playerArrayForm.value);
    const newArrayDetails = {
      prof_teams: this.playerArrayForm.get('prof_teams').value,
      prof_tours: this.playerArrayForm.get('prof_tourns').value,
    };
    const uid = localStorage.getItem('uid');
    if (!newArrayDetails.prof_teams) {
      delete newArrayDetails.prof_teams;
    }
    if (!newArrayDetails.prof_tours) {
      delete newArrayDetails.prof_tours;
    }
    if (Object.keys(newArrayDetails).length !== 0) {
      return this.ngFire
        .collection(`players/${uid}/additionalInfo`)
        .doc('otherInfo')
        .set(
          {
            ...newArrayDetails,
          },
          { merge: true }
        )
        .then(() => {
          this.snackServ.displayCustomMsg('Updated Successfully!');
          location.reload();
        });
    }
    this.playerArrayForm.reset();
  }
  onSaveFreestylerArrayInfo(): Promise<any> {
    console.log(this.fsArrayForm.value);
    if (
      !this.fsArrayForm.value ||
      this.fsArrayForm.value.top_vids.length === 0
    ) {
      return;
    }
    const newArrayDetails = {
      top_vids: this.fsArrayForm.get('top_vids').value,
    };
    if (newArrayDetails.top_vids.length > 5) {
      this.fsArrayForm.reset();
      return;
    }
    const uid = localStorage.getItem('uid');
    if (Object.keys(newArrayDetails).length !== 0) {
      return this.ngFire
        .collection('freestylers/' + uid + '/additionalInfoFs')
        .doc('fsVideos')
        .set(
          {
            ...newArrayDetails,
          },
          { merge: true }
        )
        .then(() => {
          this.snackServ.displayCustomMsg('Updated Successfully!');
          location.reload();
        });
    }
    this.fsArrayForm.reset();
  }
  onSaveSMInfo(): Promise<any> {
    console.log(this.socialInfoForm);
    const newSocials: SocialMediaLinks = {
      ig: this.socialInfoForm.value.ig,
      yt: this.socialInfoForm.value.yt,
      fb: this.socialInfoForm.value.fb,
      tw: this.socialInfoForm.value.tw,
    };
    for (const socialKey in newSocials) {
      if (newSocials.hasOwnProperty(socialKey) && !newSocials[socialKey]) {
        delete newSocials[socialKey];
      }
    }
    const uid = localStorage.getItem('uid');
    const allPromises = [];
    allPromises.push(
      this.ngFire
        .collection('players/' + uid + '/additionalInfo')
        .doc('socialMedia')
        .set(
          {
            ...newSocials,
          },
          { merge: true }
        )
    );
    allPromises.push(
      this.ngFire.collection('freestylers').doc(uid).update({
        ig: newSocials.ig,
      })
    );
    this.socialInfoForm.reset();
    return Promise.all(allPromises).then(() =>
      this.snackServ.displayCustomMsg('Updated Successfully!')
    );
    // backend code here
  }
  onChangeCredentials(changeElement: 'email' | 'password'): void {
    // log out user and then login again
    this.dialog.open(UpdateInfoComponent, {
      data: changeElement,
      autoFocus: false,
      disableClose: true,
    });
  }
  minimumAge(control: AbstractControl): Observable<Date> {
    return new Date(control?.value).getTime() >=
      new Date('1 January 2016').getTime()
      ? of({ underAge: true })
      : of(null);
  }
  onDeactivateAccount(): void {
    this.dialog.open(DeactivateAccountComponent, {
      panelClass: 'large-dialogs',
    });
  }
}

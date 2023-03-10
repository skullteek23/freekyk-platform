import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators, FormArray, AbstractControl, } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, of, Subscription } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UpdateInfoComponent } from '@shared/components/update-info/update-info.component';
import { positionGroup } from '@shared/interfaces/others.model';
import { PlayerBasicInfo, PlayerMoreInfo, SocialMediaLinks, } from '@shared/interfaces/user.model';
import { DashState } from '../../store/dash.reducer';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { LocationService } from '@shared/services/location-cities.service';
import { AuthService } from 'src/app/services/auth.service';
import { MatchConstants, PLAYING_POSITIONS, ProfileConstants } from '@shared/constants/constants';
import { DeactivateProfileRequestComponent } from '@app/dashboard/dialogs/deactivate-profile-request/deactivate-profile-request.component';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
@Component({
  selector: 'app-acc-profile',
  templateUrl: './acc-profile.component.html',
  styleUrls: ['./acc-profile.component.scss'],
})
export class AccProfileComponent implements OnInit, OnDestroy {

  readonly BIO_MAX_LIMIT = ProfileConstants.BIO_MAX_LIMIT;
  readonly ig = MatchConstants.SOCIAL_MEDIA_PRE.ig;
  readonly fb = MatchConstants.SOCIAL_MEDIA_PRE.fb;
  readonly tw = MatchConstants.SOCIAL_MEDIA_PRE.tw;
  readonly yt = MatchConstants.SOCIAL_MEDIA_PRE.yt;
  readonly positions: positionGroup[] = PLAYING_POSITIONS;

  teamsArray: FormArray = new FormArray([]);
  toursArray: FormArray = new FormArray([]);
  fsVidsArray: FormArray = new FormArray([]);
  collabsArray: FormArray = new FormArray([]);
  personalInfoForm = new FormGroup({});
  playingInfoForm = new FormGroup({});
  playerArrayForm = new FormGroup({});
  fsArrayForm = new FormGroup({});
  socialInfoForm = new FormGroup({});
  countries: string[] = [];
  states: string[] = [];
  cities: string[] = [];
  profilePhoto: string;
  subscriptions = new Subscription();
  emptyControlArray = new FormControl(null, [
    Validators.required,
    Validators.pattern(RegexPatterns.alphaNumberWithSpace),
  ]);
  isDisableArrayButton = true;
  isLoaderShown = false;
  uploadImageTask: AngularFireUploadTask;


  constructor(
    private dialog: MatDialog,
    private store: Store<{
      dash: DashState;
    }>,
    private ngFire: AngularFirestore,
    private snackBarService: SnackbarService,
    private locationService: LocationService,
    private authService: AuthService,
    private ngStorage: AngularFireStorage,
  ) { }

  ngOnInit(): void {
    this.getProfilePhoto();
    this.initForm();
    this.getCountries();
    this.getSavedValues();
    this.subscriptions.add(this.playerArrayForm.get('prof_teams')?.valueChanges.subscribe(() => (this.isDisableArrayButton = false)));
    this.subscriptions.add(this.playerArrayForm.get('prof_tours')?.valueChanges.subscribe(() => (this.isDisableArrayButton = false)));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getProfilePhoto() {
    this.store.select('dash').subscribe(response => {
      if (response) {
        this.profilePhoto = response.playerMoreInfo.imgpath_lg
      } else {
        this.profilePhoto = null;
      }
    })
  }

  initForm() {
    this.personalInfoForm = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaWithSpace)]),
      nickname: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaNumberWithSpace),]),
      gen: new FormControl(null, Validators.required),
      born: new FormControl(null, Validators.required, this.minimumAge.bind(this)),
    });

    this.playingInfoForm = new FormGroup({
      str_ft: new FormControl(null, Validators.required),
      pl_pos: new FormControl(null, Validators.required),
      jer_no: new FormControl(null, [
        Validators.required, Validators.min(1), Validators.max(99), Validators.pattern(RegexPatterns.num)]),
      location: new FormGroup({
        locCountry: new FormControl(null, Validators.required),
        locState: new FormControl(null, Validators.required),
        locCity: new FormControl(null, Validators.required),
      }),
      height: new FormControl(null, [Validators.pattern(RegexPatterns.num), Validators.required]),
      weight: new FormControl(null, [Validators.pattern(RegexPatterns.num), Validators.required]),
      bio: new FormControl(null, [Validators.required, Validators.maxLength(this.BIO_MAX_LIMIT), Validators.pattern(RegexPatterns.bio)]),
    });

    this.socialInfoForm = new FormGroup({
      ig: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.socialProfileLink)]),
      fb: new FormControl(null, Validators.pattern(RegexPatterns.socialProfileLink)),
      yt: new FormControl(null, Validators.pattern(RegexPatterns.socialProfileLink)),
      tw: new FormControl(null, Validators.pattern(RegexPatterns.socialProfileLink)),
    });
  }

  getCountries() {
    this.locationService.getCountry().subscribe(response => {
      if (response) {
        this.countries = response;
      }
    });
  }


  getSavedValues(): void {
    // this.initFsArrayForm();
    this.subscriptions.add(
      this.store.select('dash').subscribe((data) => {
        // console.log(data)
        const country = data.playerMoreInfo.locCountry;
        const state = data.playerMoreInfo.locState;
        const city = data.playerBasicInfo.locCity;
        const personalInfoData = {
          name: data.playerBasicInfo.name,
          nickname: data.playerMoreInfo.nickname,
          gen: data.playerBasicInfo.gen,
          born: data.playerMoreInfo.born ? new Date(data.playerMoreInfo.born) : null,
        }
        const playingInfoData = {
          str_ft: data.playerMoreInfo.str_ft,
          pl_pos: data.playerBasicInfo.pl_pos,
          jer_no: data.playerBasicInfo.jer_no,
          location: {
            locCountry: country,
            locState: state,
            locCity: city,
          },
          height: data.playerMoreInfo.height,
          weight: data.playerMoreInfo.weight,
          bio: data.playerMoreInfo.bio,
        }
        if (country && state && city) {
          this.onSelectCountry(country);
          this.onSelectState(state);
        }
        // for player tournaments & teams
        if (data.playerMoreInfo.prof_teams.length !== 0 && this.teamsArray.length === 0) {
          this.isDisableArrayButton = false;
          data.playerMoreInfo.prof_teams.forEach((team) => {
            const newControl = new FormControl(team);
            this.teamsArray.push(newControl);
          });
          // this.teamsArray.push(this.emptyControlArray);
        }
        if (data.playerMoreInfo.prof_tours.length !== 0 && this.toursArray.length === 0) {
          this.isDisableArrayButton = false;
          data.playerMoreInfo.prof_tours.forEach((tournament) => {
            const newControl = new FormControl(tournament);
            this.toursArray.push(newControl);
          });
          // this.toursArray.push(this.emptyControlArray);
        }
        this.playerArrayForm = new FormGroup({ prof_teams: this.teamsArray, prof_tours: this.toursArray, });
        this.personalInfoForm.patchValue({
          ...personalInfoData
        })
        this.playingInfoForm.patchValue({
          ...playingInfoData
        })
        this.socialInfoForm.patchValue({
          ...data.socials
        })
      })
    );
  }

  onSelectCountry(country: string): void {
    this.locationService.getStateByCountry(country)
      .subscribe(response => {
        if (response) {
          this.states = response;
        }
      });
  }

  onSelectState(state: string): void {
    this.locationService.getCityByState(state)
      .subscribe(response => {
        if (response) {
          this.cities = response;
        }
      });
  }

  // initFsArrayForm(): void {
  //   const uid = localStorage.getItem('uid');
  //   // for player brand collabs & fs videos
  //   this.fsArrayForm = new FormGroup({
  //     top_vids: new FormArray([
  //       new FormControl(null, [
  //         Validators.required,
  //         Validators.pattern(YOUTUBE_REGEX),
  //       ]),
  //     ]),
  //   });
  //   this.ngFire
  //     .collection(`freestylers/${uid}/additionalInfoFs`)
  //     .doc('fsVideos')
  //     .get()
  //     .pipe(map((resp) => resp.data() as FsProfileVideos))
  //     .subscribe((videos) => {
  //       // for player brand collabs & fs videos
  //       if (videos && videos.top_vids && videos.top_vids?.length > 0) {
  //         videos.top_vids.forEach((video) => {
  //           const newControl = new FormControl(
  //             video,
  //             Validators.pattern(YOUTUBE_REGEX)
  //           );
  //           this.fsVidsArray.push(newControl);
  //         });
  //       }
  //       // for player brand collabs & fs videos
  //       if (this.fsVidsArray.length !== 0) {
  //         this.fsVidsArray.push(
  //           new FormControl(null, [
  //             Validators.required,
  //             Validators.pattern(YOUTUBE_REGEX),
  //           ])
  //         );
  //       }
  //       this.fsArrayForm = new FormGroup({
  //         top_vids: this.fsVidsArray,
  //       });
  //     });
  // }

  onAddControl(controlName: string, formName: 'player' | 'fs'): void {
    let fmCtrl = new FormControl(null, [
      Validators.required,
      Validators.pattern(RegexPatterns.alphaWithSpace),
    ]);
    if (controlName === 'top_vids' && formName === 'fs') {
      fmCtrl = new FormControl(null, [
        Validators.required,
        Validators.pattern(RegexPatterns.youtube),
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
        this.snackBarService.displayCustomMsg(`Empty fields cannot be removed!`);
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
        this.snackBarService.displayCustomMsg(`Empty fields cannot be removed!`);
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
      const newDetails: Partial<PlayerMoreInfo> = {};
      if (this.personalInfoForm.get('born').dirty && this.personalInfoForm.get('born').value) {
        newDetails.born = new Date(this.personalInfoForm.get('born').value).getTime();
      }
      if (this.personalInfoForm.get('nickname').dirty && this.personalInfoForm.get('nickname').value) {
        newDetails.nickname = this.personalInfoForm.get('nickname').value.trim();
      }
      const newBasicDetails: any = {};
      if (this.personalInfoForm.get('gen').dirty && this.personalInfoForm.get('gen').value) {
        newBasicDetails.gen = this.personalInfoForm.get('gen').value;
      }
      if (this.personalInfoForm.get('name').dirty && this.personalInfoForm.get('name').value) {
        newBasicDetails.name = this.personalInfoForm.get('name').value.trim();
      }

      const uid = localStorage.getItem('uid');
      const allPromises = [];

      if (Object.keys(newDetails).length) {
        allPromises.push(
          this.ngFire
            .collection('players/' + uid + '/additionalInfo')
            .doc('otherInfo')
            .set({ ...newDetails, }, { merge: true })
        );
      }
      if (Object.keys(newBasicDetails).length) {
        // allPromises.push(
        //   this.ngFire
        //     .collection('freestylers')
        //     .doc(uid)
        //     .update({
        //       ...newDetails,
        //       ...newBasicDetails
        //     })
        // );
        allPromises.push(this.authService.updateDisplayName(newBasicDetails.name));
        allPromises.push(
          this.ngFire
            .collection('players')
            .doc(uid)
            .update({
              ...newBasicDetails,
            })
        );
      }
      if (allPromises.length) {
        return Promise.all(allPromises)
          .then(() => this.snackBarService.displayCustomMsg('Updated Successfully!'))
          .catch(error => this.snackBarService.displayError())
      }
    }

    // backend code here
  }

  onSavePlayerInfo(): Promise<any> {

    if (this.playingInfoForm.dirty && this.playingInfoForm.valid) {
      const updatedValues: any = {};
      for (const key in this.playingInfoForm.controls) {
        if (this.playingInfoForm.valid) {
          const control = this.playingInfoForm.controls[key];
          if (control && control.valid && control.dirty && control.value !== null && control.value !== undefined) {
            const controlValue = control?.value;
            updatedValues[key] = controlValue;
          }
        }
      }

      // console.log(updatedValues);
      if (Object.keys(updatedValues).length === 0) {
        return;
      }

      const newDetails: Partial<PlayerMoreInfo> = {};
      const newBasicDetails: Partial<PlayerBasicInfo> = {};
      const uid = localStorage.getItem('uid');
      const allPromises = [];

      if (updatedValues['jer_no'] || updatedValues['location']['locCity'] || updatedValues['pl_pos']) {
        newBasicDetails['jer_no'] = this.playingInfoForm.get('jer_no').value;
        newBasicDetails['locCity'] = this.playingInfoForm.value.location.locCity;
        newBasicDetails['pl_pos'] = this.playingInfoForm.get('pl_pos').value;
      }

      newDetails['locState'] = this.playingInfoForm.value.location.locState;
      newDetails['locCountry'] = this.playingInfoForm.value.location.locCountry;
      newDetails['height'] = this.playingInfoForm.get('height').value;
      newDetails['weight'] = this.playingInfoForm.get('weight').value;
      newDetails['str_ft'] = this.playingInfoForm.get('str_ft').value;
      newDetails['bio'] = this.playingInfoForm.get('bio').value.trim();
      newDetails['profile'] = true;

      if (Object.keys(newDetails).length) {
        allPromises.push(
          this.ngFire
            .collection('players/' + uid + '/additionalInfo')
            .doc('otherInfo')
            .set({ ...newDetails, }, { merge: true })
        );
      }

      if (Object.keys(newBasicDetails).length) {
        allPromises.push(
          this.ngFire
            .collection('players')
            .doc(uid)
            .update({
              ...newBasicDetails,
            })
        );
      }

      // allPromises.push(
      //   this.ngFire
      //     .collection('freestylers')
      //     .doc(uid)
      //     .update({
      //       ...newFsDetails,
      //     })
      // );
      return Promise.all(allPromises)
        .then(() => this.snackBarService.displayCustomMsg('Updated Successfully!'))
        .catch(error => this.snackBarService.displayError())
    } else {
      this.snackBarService.displayError('All fields are mandatory!')
    }
  }

  onSavePlayerArrayInfo(): Promise<any> {
    // console.log(this.playerArrayForm.value);
    const newArrayDetails = {
      prof_teams: this.playerArrayForm.get('prof_teams').value,
      prof_tours: this.playerArrayForm.get('prof_tours').value,
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
        .set({ ...newArrayDetails, }, { merge: true })
        .then(() => {
          this.snackBarService.displayCustomMsg('Updated Successfully!');
        })
        .catch(error => this.snackBarService.displayError());
    }
    this.playerArrayForm.reset();
  }

  // onSaveFreestylerArrayInfo(): Promise<any> {
  //   // console.log(this.fsArrayForm.value);
  //   if (
  //     !this.fsArrayForm.value ||
  //     this.fsArrayForm.value.top_vids.length === 0
  //   ) {
  //     return;
  //   }
  //   const newArrayDetails = {
  //     top_vids: this.fsArrayForm.get('top_vids').value,
  //   };
  //   if (newArrayDetails.top_vids.length > 5) {
  //     this.fsArrayForm.reset();
  //     return;
  //   }
  //   const uid = localStorage.getItem('uid');
  //   if (Object.keys(newArrayDetails).length !== 0) {
  //     return this.ngFire
  //       .collection('freestylers/' + uid + '/additionalInfoFs')
  //       .doc('fsVideos')
  //       .set(
  //         {
  //           ...newArrayDetails,
  //         },
  //         { merge: true }
  //       )
  //       .then(() => {
  //         this.snackBarService.displayCustomMsg('Updated Successfully!');
  //         location.reload();
  //       });
  //   }
  //   this.fsArrayForm.reset();
  // }

  get locationCountry(): FormControl {
    return ((this.playingInfoForm.get('location') as FormGroup).controls['locCountry'] as FormControl);
  }

  get locationState(): FormControl {
    return ((this.playingInfoForm.get('location') as FormGroup).controls['locState'] as FormControl);
  }

  get locationCity(): FormControl {
    return ((this.playingInfoForm.get('location') as FormGroup).controls['locCity'] as FormControl);
  }

  onSaveSMInfo(): Promise<any> {
    // console.log(this.socialInfoForm);
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
    // allPromises.push(
    //   this.ngFire.collection('freestylers').doc(uid).update({
    //     ig: newSocials.ig,
    //   })
    // );
    this.socialInfoForm.reset();
    return Promise.all(allPromises)
      .then(() => this.snackBarService.displayCustomMsg('Updated Successfully!'))
      .catch(error => this.snackBarService.displayError())
    // backend code here
  }



  minimumAge(control: AbstractControl): Observable<Date> {
    return new Date(control?.value).getTime() >=
      new Date(ProfileConstants.MAX_BIRTH_DATE_ALLOWED).getTime()
      ? of({ underAge: true })
      : of(null);
  }



  async uploadPhoto(file: File): Promise<any> {
    if (!file) {
      this.snackBarService.displayError();
      return;
    }
    this.isLoaderShown = true;
    const uid = localStorage.getItem('uid');
    this.uploadImageTask = this.ngStorage.upload('/profileImages/profileimage_' + uid, file);
    const downloadURL: string = await this.uploadImageTask.then((res) => res.ref.getDownloadURL());
    if (downloadURL) {
      return this.ngFire
        .collection(`players/${uid}/additionalInfo`)
        .doc('otherInfo')
        .set({ imgpath_lg: downloadURL, }, { merge: true })
        .then(() => {
          this.snackBarService.displayCustomMsg('Your Profile Photo has been set!')
        })
        .catch(() => this.snackBarService.displayError())
        .finally(() => {
          this.isLoaderShown = false;
        });
    }
  }
}

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
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UpdateInfoComponent } from 'src/app/shared/components/update-info/update-info.component';
import { positionGroup } from 'src/app/shared/interfaces/others.model';
import {
  BrandCollabInfo,
  FsProfileVideos,
  PlayerBasicInfo,
  PlayerMoreInfo,
  SocialMediaLinks,
} from 'src/app/shared/interfaces/user.model';
import { DashState } from '../../store/dash.reducer';
import { YOUTUBE_REGEX } from 'src/app/shared/Constants/REGEX';
import { ActivatedRoute, Router } from '@angular/router';
import { PLAYING_POSITIONS } from 'src/app/shared/Constants/PLAYING_POSITIONS';
import { LocationCitiesService } from 'src/app/services/location-cities.service';
import { MatSelectChange } from '@angular/material/select';
@Component({
  selector: 'app-acc-profile',
  templateUrl: './acc-profile.component.html',
  styleUrls: ['./acc-profile.component.css'],
})
export class AccProfileComponent implements OnInit, OnDestroy {
  personalInfoForm: FormGroup;
  playingInfoForm: FormGroup;
  FreestylingInfoForm: FormGroup;
  socialInfoForm: FormGroup;
  cities = ['Ghaziabad'];
  states = ['Uttar Pradesh'];
  countries = ['India'];
  filteredOptions: positionGroup[] = PLAYING_POSITIONS;
  countries$: Observable<string[]>;
  states$: Observable<string[]>;
  cities$: Observable<string[]>;
  subscriptions = new Subscription();

  constructor(
    private dialog: MatDialog,
    private store: Store<{
      dash: DashState;
    }>,
    private ngFire: AngularFirestore,
    private snackServ: SnackbarService,
    private route: ActivatedRoute,
    private router: Router,
    private locationServ: LocationCitiesService
  ) {}
  ngOnInit(): void {
    this.initForm();
    this.countries$ = this.locationServ.getCountry();
    this.subscriptions.add(
      this.route.fragment.subscribe((frag) => {
        if (
          frag &&
          ['personal', 'freestyle', 'player', 'social-media'].includes(frag)
        ) {
          console.log(frag);
          this.scrollToElement(frag);
        } else {
          this.router.navigate(['/dashboard', 'account', 'profile'], {
            fragment: 'personal',
          });
        }
      })
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
  initForm(): void {
    this.subscriptions.add(
      this.store.select('dash').subscribe((data) => {
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
            null,
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
          prof_teams: new FormArray([new FormControl(null)]),
          prof_tourns: new FormArray([new FormControl(null)]),
        });
        this.FreestylingInfoForm = new FormGroup({
          bio: new FormControl(data.fsInfo.bio, [
            Validators.maxLength(129),
            // tslint:disable-next-line: quotemark
            Validators.pattern("^[a-zA-Z0-9.!' ]*$"),
          ]),
          top_vids: new FormArray([
            new FormControl(null, [Validators.pattern(YOUTUBE_REGEX)]),
          ]),
          br_collabs: new FormArray([new FormControl(null)]),
        });
        this.socialInfoForm = new FormGroup({
          ig: new FormControl(data.socials.ig, Validators.required),
          fb: new FormControl(data.socials.fb, Validators.required),
          yt: new FormControl(data.socials.yt, Validators.required),
          tw: new FormControl(data.socials.tw, Validators.required),
        });
      })
    );
  }
  scrollToElement(elementId: string): void {
    document.getElementById(elementId).scrollIntoView({
      behavior: 'smooth',
    });
  }
  onAddControl(controlName: string, formName: 'player' | 'fs'): void {
    let fmCtrl = new FormControl(null, Validators.required);
    if (controlName === 'top_vids' && formName === 'fs') {
      fmCtrl = new FormControl(null, [
        Validators.required,
        Validators.pattern(YOUTUBE_REGEX),
      ]);
    }
    if (formName === 'player') {
      (this.playingInfoForm.get(controlName) as FormArray).push(fmCtrl);
    } else if (formName === 'fs') {
      (this.FreestylingInfoForm.get(controlName) as FormArray).push(fmCtrl);
    } else {
      return;
    }
  }
  onRemoveControl(
    controlName: string,
    formName: 'player' | 'fs',
    removeIndex: number
  ): any {
    if (formName === 'player') {
      (this.playingInfoForm.get(controlName) as FormArray).removeAt(
        removeIndex
      );
    } else if (formName === 'fs') {
      (this.FreestylingInfoForm.get(controlName) as FormArray).removeAt(
        removeIndex
      );
    } else {
      return;
    }
  }
  getFormArray(controlName: string, formName: 'player' | 'fs'): any {
    if (formName === 'player') {
      return (this.playingInfoForm.get(controlName) as FormArray).controls;
    } else if (formName === 'fs') {
      return (this.FreestylingInfoForm.get(controlName) as FormArray).controls;
    } else {
      return [];
    }
  }
  onSavePersonalInfo(): Promise<any[]> {
    // console.log(this.personalInfoForm);
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

      allPromises.push(
        this.snackServ.displayCustomMsg('Updated Successfully!')
      );
      return Promise.all(allPromises);
    }

    // backend code here
  }
  onSavePlayerInfo(): Promise<any[]> {
    console.log(this.playingInfoForm);
    console.log(this.playingInfoForm.get('prof_teams').value);
    if (this.playingInfoForm.dirty && this.playingInfoForm.valid) {
      const newDetails: PlayerMoreInfo = {
        locState: this.playingInfoForm.get('loc_state').value,
        locCountry: this.playingInfoForm.get('loc_country').value,
        height: this.playingInfoForm.get('height').value,
        weight: this.playingInfoForm.get('weight').value,
        str_ft: this.playingInfoForm.get('str_foot').value,
        prof_teams: this.playingInfoForm.get('prof_teams').value,
        prof_tours: this.playingInfoForm.get('prof_tourns').value,
        profile: true,
      };
      if (this.playingInfoForm.get('prof_teams')?.value[0] == null) {
        delete newDetails.prof_teams;
      }
      if (this.playingInfoForm.get('prof_tourns')?.value[0] == null) {
        delete newDetails.prof_tours;
      }
      const newBasicDetails: {} = {
        jer_no: this.playingInfoForm.get('j_num').value,
        locCity: this.playingInfoForm.get('loc_city').value,
        pl_pos: this.playingInfoForm.get('p_pos').value,
      };
      const newFsDetails: {} = {
        locCountry: this.playingInfoForm.get('loc_country').value,
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
      allPromises.push(
        this.snackServ.displayCustomMsg('Updated Successfully!')
      );
      return Promise.all(allPromises);

      // .then(() => this.snackServ.displayCustomMsg('Update Successfully!'));
    }
    // backend code here
  }
  onSaveFsInfo(): Promise<any[]> {
    console.log(this.FreestylingInfoForm);
    if (this.FreestylingInfoForm.dirty) {
      const newFsDetails: {} = {
        bio: this.FreestylingInfoForm.value.bio,
      };
      const newVids: FsProfileVideos = {
        vid_1: this.FreestylingInfoForm.value.top_vids[0],
        vid_2:
          this.FreestylingInfoForm.value.top_vids.length === 2
            ? this.FreestylingInfoForm.value.top_vids[1]
            : null,
        vid_3:
          this.FreestylingInfoForm.value.top_vids.length === 2
            ? this.FreestylingInfoForm.value.top_vids[2]
            : null,
        vid_4:
          this.FreestylingInfoForm.value.top_vids.length === 2
            ? this.FreestylingInfoForm.value.top_vids[3]
            : null,
        vid_5:
          this.FreestylingInfoForm.value.top_vids.length === 2
            ? this.FreestylingInfoForm.value.top_vids[4]
            : null,
      };
      const uid = localStorage.getItem('uid');
      const allPromises = [];
      allPromises.push(
        this.ngFire
          .collection('players/' + uid + '/additionalInfo')
          .doc('otherInfo')
          .update({
            ...newFsDetails,
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
      allPromises.push(
        this.ngFire
          .collection('freestylers/' + uid + '/additionalInfoFs')
          .doc('fsVideos')
          .set(newVids)
      );
      allPromises.push(
        this.snackServ.displayCustomMsg('Updated Successfully!')
      );
      return Promise.all(allPromises);
    }
    // backend code here
  }
  onSaveSMInfo(): Promise<any[]> {
    console.log(this.socialInfoForm);
    const newSocials: SocialMediaLinks = {
      ig: this.socialInfoForm.value.ig,
      yt: this.socialInfoForm.value.yt,
      fb: this.socialInfoForm.value.fb,
      tw: this.socialInfoForm.value.tw,
    };
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

    allPromises.push(this.snackServ.displayCustomMsg('Updated Successfully!'));
    return Promise.all(allPromises);
    // backend code here
  }
  onChange(changeElement: 'email' | 'password'): void {
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
}

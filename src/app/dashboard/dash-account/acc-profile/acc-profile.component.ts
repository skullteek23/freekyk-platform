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
import { of, Subscription } from 'rxjs';
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
import { Timestamp } from '@firebase/firestore-types';
import { YOUTUBE_REGEX } from 'src/app/shared/Constants/REGEX';
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
  filteredOptions: positionGroup[] = [
    {
      position: 'Attacker',
      pos_name: ['Striker', 'Left Winger', 'Right Winger', 'Center Forward'],
    },
    {
      position: 'Midfielder',
      pos_name: ['Center Midfielder', 'Right Midfielder', 'Left Midfielder'],
    },
    {
      position: 'Defender',
      pos_name: ['Center Back', 'Left Back', 'Right Back', 'GoalKeeper'],
    },
  ];
  newSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private authServ: AuthService,
    private store: Store<{
      dash: DashState;
    }>,
    private ngFire: AngularFirestore,
    private snackServ: SnackbarService
  ) {
    this.newSubscription = this.store.select('dash').subscribe((data) => {
      this.personalInfoForm = new FormGroup({
        name: new FormControl(
          data.playerBasicInfo.name,
          Validators.pattern('^[a-zA-Z ]*$')
        ),
        nickname: new FormControl(data.playerMoreInfo.nickname, [
          Validators.pattern('^[a-zA-Z ]*$'),
          Validators.required,
        ]),
        gender: new FormControl(data.playerBasicInfo.gen, Validators.required),
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
    });
  }
  ngOnInit(): void {}
  ngOnDestroy() {
    this.newSubscription.unsubscribe();
  }
  onAddControl(controlName: string, formName: 'player' | 'fs') {
    let fmCtrl = new FormControl(null, Validators.required);
    if (controlName == 'top_vids' && formName == 'fs')
      fmCtrl = new FormControl(null, [
        Validators.required,
        Validators.pattern(YOUTUBE_REGEX),
      ]);
    if (formName == 'player')
      (<FormArray>this.playingInfoForm.get(controlName)).push(fmCtrl);
    else if (formName == 'fs')
      (<FormArray>this.FreestylingInfoForm.get(controlName)).push(fmCtrl);
    else return;
  }
  onRemoveControl(
    controlName: string,
    formName: 'player' | 'fs',
    removeIndex: number
  ) {
    if (formName == 'player')
      (<FormArray>this.playingInfoForm.get(controlName)).removeAt(removeIndex);
    else if (formName == 'fs')
      (<FormArray>this.FreestylingInfoForm.get(controlName)).removeAt(
        removeIndex
      );
    else return;
  }
  getFormArray(controlName: string, formName: 'player' | 'fs') {
    if (formName == 'player')
      return (<FormArray>this.playingInfoForm.get(controlName)).controls;
    else if (formName == 'fs')
      return (<FormArray>this.FreestylingInfoForm.get(controlName)).controls;
    else return [];
  }
  onSavePersonalInfo() {
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
      let allPromises = [];

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
      // .then(() => this.snackServ.displayCustomMsg('Update Successfully!'));
    }

    //backend code here
  }
  onSavePlayerInfo() {
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
        delete newDetails['prof_teams'];
      }
      if (this.playingInfoForm.get('prof_tourns')?.value[0] == null) {
        delete newDetails['prof_tours'];
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
      let allPromises = [];
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
    //backend code here
  }
  onSaveFsInfo() {
    console.log(this.FreestylingInfoForm);
    if (this.FreestylingInfoForm.dirty) {
      const newFsDetails: {} = {
        bio: this.FreestylingInfoForm.value['bio'],
      };
      const newVids: FsProfileVideos = {
        vid_1: this.FreestylingInfoForm.value['top_vids'][0],
        vid_2:
          this.FreestylingInfoForm.value['top_vids'].length == 2
            ? this.FreestylingInfoForm.value['top_vids'][1]
            : null,
        vid_3:
          this.FreestylingInfoForm.value['top_vids'].length == 2
            ? this.FreestylingInfoForm.value['top_vids'][2]
            : null,
        vid_4:
          this.FreestylingInfoForm.value['top_vids'].length == 2
            ? this.FreestylingInfoForm.value['top_vids'][3]
            : null,
        vid_5:
          this.FreestylingInfoForm.value['top_vids'].length == 2
            ? this.FreestylingInfoForm.value['top_vids'][4]
            : null,
      };
      const uid = localStorage.getItem('uid');
      let allPromises = [];
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
    //backend code here
  }
  onSaveSMInfo() {
    console.log(this.socialInfoForm);
    const newSocials: SocialMediaLinks = {
      ig: this.socialInfoForm.value['ig'],
      yt: this.socialInfoForm.value['yt'],
      fb: this.socialInfoForm.value['fb'],
      tw: this.socialInfoForm.value['tw'],
    };
    const uid = localStorage.getItem('uid');
    let allPromises = [];
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
    //backend code here
  }
  onChange(changeElement: 'email' | 'password') {
    // log out user and then login again
    this.dialog.open(UpdateInfoComponent, {
      data: changeElement,
      autoFocus: false,
      disableClose: true,
    });
  }
  minimumAge(control: AbstractControl) {
    return new Date(control?.value).getTime() >=
      new Date('1 January 2016').getTime()
      ? of({ underAge: true })
      : of(null);
  }
}

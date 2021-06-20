import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import {
  TeamBasicInfo,
  TeamMoreInfo,
} from 'src/app/shared/interfaces/team.model';
import { TeamState } from '../../dash-team-manag/store/team.reducer';
import { TeamgalleryComponent } from '../teamgallery/teamgallery.component';

@Component({
  selector: 'app-teamsettings',
  templateUrl: './teamsettings.component.html',
  styleUrls: ['./teamsettings.component.css'],
})
export class TeamsettingsComponent implements OnInit {
  $teamPhoto: File;
  $teamLogo: File;
  file1Selected = false;
  file2Selected = false;
  cities = ['Ghaziabad'];
  states = ['Uttar Pradesh'];
  TeamInfoForm: FormGroup = new FormGroup({});
  socialInfoForm: FormGroup = new FormGroup({});

  constructor(
    public dialogRef: MatDialogRef<TeamsettingsComponent>,
    private snackServ: SnackbarService,
    private ngFire: AngularFirestore,
    private ngStorage: AngularFireStorage,
    private store: Store<{
      team: TeamState;
    }>,
    private dialog: MatDialog
  ) {
    this.store
      .select('team')
      .pipe(
        map(
          (resp) =>
            <{ main: TeamBasicInfo; more: TeamMoreInfo }>{
              main: resp.basicInfo,
              more: resp.moreInfo,
            }
        )
      )
      .subscribe((info) => {
        this.TeamInfoForm = new FormGroup({
          t_name: new FormControl(
            info.main.tname,
            Validators.pattern('^[A-Za-z0-9 ]*$')
          ),
          t_slogan: new FormControl(info.more.tslogan, [
            Validators.required,
            Validators.pattern('^[A-Za-z0-9 ?.!,\'"]*$'),
            Validators.maxLength(50),
          ]),
          t_desc: new FormControl(info.more.tdesc, [
            Validators.required,
            Validators.pattern('^[A-Za-z0-9 ?.!,\'"]*$'),
            Validators.maxLength(300),
          ]),
          t_LocCity: new FormControl(info.main.locCity, Validators.required),
          t_LocState: new FormControl(info.main.locState, Validators.required),
        });

        this.socialInfoForm = new FormGroup({
          ig: new FormControl(info.more?.tSocials?.ig, Validators.required),
          fb: new FormControl(info.more?.tSocials?.fb, Validators.required),
          yt: new FormControl(info.more?.tSocials?.yt, Validators.required),
          tw: new FormControl(info.more?.tSocials?.tw, Validators.required),
        });
      });
  }
  ngOnInit(): void {}
  async onSaveImages() {
    const logo = await this.onUploadTeamLogo();
    const image = await this.onUploadTeamPhoto();
    console.log(logo);
    console.log(image);
    const tid = sessionStorage.getItem('tid');
    this.ngFire
      .collection('teams')
      .doc(tid)
      .update({
        imgpath: image,
        imgpath_logo: logo,
      })
      .then(this.onFinishOp.bind(this));
  }
  onAddControl() {
    const fmCtrl = new FormControl(null, Validators.required);
    (<FormArray>this.TeamInfoForm.get('t_Gallery')).push(fmCtrl);
  }
  onChooseTeamImage(ev: any) {
    this.file1Selected = true;
    this.$teamPhoto = ev.target.files[0];
  }
  onChooseTeamLogoImage(ev: any) {
    this.file2Selected = true;
    this.$teamLogo = ev.target.files[0];
  }
  onOpenTeamGalleryDialog() {
    this.dialog.open(TeamgalleryComponent, {
      panelClass: 'fk-dialogs',
      disableClose: true,
    });
    this.onCloseDialog();
  }
  async onUploadTeamLogo() {
    // backend code here
    if (this.$teamLogo == null) {
      this.snackServ.displayError();
      return Promise.reject();
    }
    return (
      await this.ngStorage.upload(
        '/teamLogos' + Math.random() + this.$teamLogo.name,
        this.$teamLogo
      )
    ).ref.getDownloadURL();
  }
  async onUploadTeamPhoto() {
    // backend code here
    if (this.$teamPhoto == null) {
      this.snackServ.displayError();
      return Promise.reject();
    }
    return (
      await this.ngStorage.upload(
        '/teamPictures' + Math.random() + this.$teamPhoto.name,
        this.$teamPhoto
      )
    ).ref.getDownloadURL();
  }

  getFormArray() {
    return (<FormArray>this.TeamInfoForm.get('t_Gallery')).controls;
  }
  onLeaveTeam() {
    // backend code here
    this.snackServ.displayCustomMsg('You have now left the team!');
  }
  onDeleteTeam() {
    // backend code here
    this.snackServ.displayCustomMsg('Team deleted successfully!');
  }
  onSubmitTeamInfo() {
    // do something
    if (this.TeamInfoForm.dirty && this.TeamInfoForm.valid) {
      // console.log(logo);
      // console.log(image);
      const newDetails: {} = {
        tname: this.TeamInfoForm.value['t_name'],
        locState: this.TeamInfoForm.value['t_LocCity'],
        locCity: this.TeamInfoForm.value['t_LocState'],
      };
      const newMoreDetails: {} = {
        tslogan: this.TeamInfoForm.value['t_slogan'],
        tdesc: this.TeamInfoForm.value['t_desc'],
      };
      const tid = sessionStorage.getItem('tid');
      let allPromises: any = [];
      allPromises.push(
        this.ngFire
          .collection('teams/' + tid + '/additionalInfo')
          .doc('moreInfo')
          .update({
            ...newMoreDetails,
          })
      );
      allPromises.push(
        this.ngFire
          .collection('teams')
          .doc(tid)
          .update({
            ...newDetails,
          })
      );
      // allPromises.push(
      //   this.snackServ.displayCustomMsg('Updated Successfully!')
      // );
      // allPromises.push(this.onCloseDialog());
      return Promise.all(allPromises).then(this.onFinishOp.bind(this));
    } else {
      console.log('nothign changed');
    }
  }
  onFinishOp() {
    this.onCloseDialog();
    this.snackServ.displayCustomMsg('Updated Successfully!');
  }
  onSubmitTeamSocial() {
    // do something
    console.log(this.socialInfoForm);
    const tid = sessionStorage.getItem('tid');
    this.ngFire
      .collection('teams')
      .doc(tid)
      .collection('additionalInfo')
      .doc('moreInfo')
      .update({
        tSocials: this.socialInfoForm.value,
      })
      .then(this.onFinishOp.bind(this));
  }

  onCloseDialog() {
    this.dialogRef.close();
  }
}

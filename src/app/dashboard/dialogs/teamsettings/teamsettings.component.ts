import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocationCitiesService } from 'src/app/services/location-cities.service';
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
export class TeamsettingsComponent implements OnInit, OnDestroy {
  $teamPhoto: File;
  $teamLogo: File;
  file1Selected = false;
  file2Selected = false;
  cities$: Observable<string[]>;
  states$: Observable<string[]>;
  TeamInfoForm: FormGroup = new FormGroup({});
  socialInfoForm: FormGroup = new FormGroup({});
  subscriptions = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<TeamsettingsComponent>,
    private snackServ: SnackbarService,
    private ngFire: AngularFirestore,
    private ngStorage: AngularFireStorage,
    private locationServ: LocationCitiesService,
    private store: Store<{
      team: TeamState;
    }>,
    private dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.subscriptions.add(
      this.store
        .select('team')
        .pipe(
          map(
            (resp) =>
              ({
                main: resp.basicInfo,
                more: resp.moreInfo,
              } as { main: TeamBasicInfo; more: TeamMoreInfo })
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
            t_LocState: new FormControl(
              info.main.locState,
              Validators.required
            ),
          });

          this.socialInfoForm = new FormGroup({
            ig: new FormControl(info.more?.tSocials?.ig, Validators.required),
            fb: new FormControl(info.more?.tSocials?.fb, Validators.required),
            yt: new FormControl(info.more?.tSocials?.yt, Validators.required),
            tw: new FormControl(info.more?.tSocials?.tw, Validators.required),
          });
        })
    );
  }
  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
  onOpenStateList(): void {
    this.states$ = this.locationServ.getCityByState('India');
  }
  onSelectState(selection: MatSelectChange): void {
    this.cities$ = this.locationServ.getCityByState(selection.value);
  }
  async onSaveImages(): Promise<any> {
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
  onAddControl(): void {
    const fmCtrl = new FormControl(null, Validators.required);
    (this.TeamInfoForm.get('t_Gallery') as FormArray).push(fmCtrl);
  }
  onChooseTeamImage(ev: any): void {
    this.file1Selected = true;
    this.$teamPhoto = ev.target.files[0];
  }
  onChooseTeamLogoImage(ev: any): void {
    this.file2Selected = true;
    this.$teamLogo = ev.target.files[0];
  }
  onOpenTeamGalleryDialog(): void {
    this.dialog.open(TeamgalleryComponent, {
      panelClass: 'fk-dialogs',
      disableClose: true,
    });
    this.onCloseDialog();
  }
  async onUploadTeamLogo(): Promise<any> {
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
  async onUploadTeamPhoto(): Promise<any> {
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

  getFormArray(): any {
    return (this.TeamInfoForm.get('t_Gallery') as FormArray).controls;
  }
  onSubmitTeamInfo(): Promise<any[]> {
    // do something
    if (this.TeamInfoForm.dirty && this.TeamInfoForm.valid) {
      // console.log(logo);
      // console.log(image);
      const newDetails: {} = {
        tname: this.TeamInfoForm.value.name,
        locState: this.TeamInfoForm.value.LocCity,
        locCity: this.TeamInfoForm.value.LocState,
      };
      const newMoreDetails: {} = {
        tslogan: this.TeamInfoForm.value.slogan,
        tdesc: this.TeamInfoForm.value.desc,
      };
      const tid = sessionStorage.getItem('tid');
      const allPromises: any = [];
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
      return Promise.all(allPromises).then(this.onFinishOp.bind(this));
    } else {
      console.log('nothing changed');
    }
  }
  onFinishOp(): void {
    this.onCloseDialog();
    this.snackServ.displayCustomMsg('Updated Successfully!');
  }
  onSubmitTeamSocial(): void {
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
  onCloseDialog(): void {
    this.dialogRef.close();
  }
}

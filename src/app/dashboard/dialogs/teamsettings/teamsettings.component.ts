import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormGroup, FormControl, Validators, FormArray, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocationService } from '@shared/services/location-cities.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { SOCIAL_MEDIA_PRE } from '@shared/Constants/DEFAULTS';
import {
  TeamBasicInfo,
  TeamMoreInfo,
} from '@shared/interfaces/team.model';
import { TeamState } from '../../dash-team-manag/store/team.reducer';
import { TeamgalleryComponent } from '../teamgallery/teamgallery.component';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { ProfileConstants } from '@shared/constants/constants';

@Component({
  selector: 'app-teamsettings',
  templateUrl: './teamsettings.component.html',
  styleUrls: ['./teamsettings.component.scss'],
})
export class TeamsettingsComponent implements OnInit, OnDestroy {

  readonly ig = SOCIAL_MEDIA_PRE.ig;
  readonly fb = SOCIAL_MEDIA_PRE.fb;
  readonly tw = SOCIAL_MEDIA_PRE.tw;
  readonly yt = SOCIAL_MEDIA_PRE.yt;
  readonly sloganLimit = ProfileConstants.TEAM_SLOGAN_MAX_LIMIT;
  readonly descriptionLimit = ProfileConstants.TEAM_DESC_MAX_LIMIT;

  $teamPhoto: File;
  $teamLogo: File;
  file1Selected = false;
  file2Selected = false;
  cities$: Observable<string[]>;
  states$: Observable<string[]>;
  teamInfoForm: FormGroup;
  socialInfoForm: FormGroup;
  subscriptions = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<TeamsettingsComponent>,
    private snackServ: SnackbarService,
    private ngFire: AngularFirestore,
    private ngStorage: AngularFireStorage,
    private locationServ: LocationService,
    private store: Store<{ team: TeamState; }>,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getStates();
    this.getSavedInfo();
  }

  getSavedInfo() {
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
          const location = {
            locCity: info.main.locCity || null,
            locState: info.main.locState || null
          }
          const formData = {
            tslogan: info.more.tslogan || null,
            tdesc: info.more.tdesc || null,
            location
          }
          this.teamInfoForm.patchValue({
            ...formData
          });
          this.socialInfoForm.patchValue({
            ...info.more.tSocials
          })
          this.teamInfoForm.get('location').markAsUntouched();
          if (location.locState) {
            this.onSelectState(location.locState);
          }
        })
    );
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  initForm() {
    this.teamInfoForm = new FormGroup({
      // t_name: new FormControl(info.main.tname, Validators.pattern(RegexPatterns.alphaWithSpace)),
      tslogan: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.bio), Validators.maxLength(this.sloganLimit)]),
      tdesc: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.bio), Validators.maxLength(this.descriptionLimit)]),
      location: new FormGroup({
        locCity: new FormControl(null),
        locState: new FormControl(null),
      }),
    });

    this.socialInfoForm = new FormGroup({
      ig: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.socialProfileLink)]),
      yt: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.socialProfileLink)]),
      fb: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.socialProfileLink)]),
      tw: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.socialProfileLink)]),
    });
  }

  getStates(): void {
    this.states$ = this.locationServ.getStateByCountry();
  }

  onSelectState(state: string): void {
    this.cities$ = this.locationServ.getCityByState(state);
  }

  async onSaveImages(): Promise<any> {
    const logo = await this.onUploadTeamLogo();
    const image = await this.onUploadTeamPhoto();
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
    (this.teamInfoForm.get('t_Gallery') as FormArray).push(fmCtrl);
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
    const tid = sessionStorage.getItem('tid');
    // backend code here
    if (this.$teamLogo == null) {
      this.snackServ.displayError();
      return Promise.reject();
    }
    return (
      await this.ngStorage.upload('/teams/logo/' + tid, this.$teamLogo)
    ).ref.getDownloadURL();
  }
  async onUploadTeamPhoto(): Promise<any> {
    const tid = sessionStorage.getItem('tid');
    // backend code here
    if (this.$teamPhoto == null) {
      this.snackServ.displayError();
      return Promise.reject();
    }
    return (
      await this.ngStorage.upload('/teams/images/' + tid, this.$teamPhoto)
    ).ref.getDownloadURL();
  }

  getFormArray(): any {
    return (this.teamInfoForm.get('t_Gallery') as FormArray).controls;
  }

  onSubmitTeamInfo(): void {
    if (this.teamInfoForm.dirty && this.teamInfoForm.valid) {
      const newDetails: {} = {
        // tname: this.teamInfoForm.value.t_name,
        locState: this.teamInfoForm.value.location.locState,
        locCity: this.teamInfoForm.value.location.locCity,
      };
      const newMoreDetails: {} = {
        tslogan: this.teamInfoForm.value.tslogan,
        tdesc: this.teamInfoForm.value.tdesc,
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
      Promise.all(allPromises).then(this.onFinishOp.bind(this));
    }
  }

  onFinishOp(): void {
    this.snackServ.displayCustomMsg('Updated Successfully!');
    location.reload();
  }

  onSubmitTeamSocial(): void {
    // do something
    // console.log(this.socialInfoForm);
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

  get tdesc(): AbstractControl {
    return this.teamInfoForm?.get('tdesc');
  }

  get tslogan(): AbstractControl {
    return this.teamInfoForm?.get('tslogan');
  }
}

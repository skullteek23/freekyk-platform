import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocationService } from '@shared/services/location-cities.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { TeamBasicInfo, TeamMoreInfo, } from '@shared/interfaces/team.model';
import { TeamState } from '../../dash-team-manag/store/team.reducer';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { MatchConstants, ProfileConstants } from '@shared/constants/constants';

@Component({
  selector: 'app-teamsettings',
  templateUrl: './teamsettings.component.html',
  styleUrls: ['./teamsettings.component.scss'],
})
export class TeamsettingsComponent implements OnInit, OnDestroy {

  readonly ig = MatchConstants.SOCIAL_MEDIA_PRE.ig;
  readonly fb = MatchConstants.SOCIAL_MEDIA_PRE.fb;
  readonly tw = MatchConstants.SOCIAL_MEDIA_PRE.tw;
  readonly yt = MatchConstants.SOCIAL_MEDIA_PRE.yt;
  readonly sloganLimit = ProfileConstants.TEAM_SLOGAN_MAX_LIMIT;
  readonly descriptionLimit = ProfileConstants.TEAM_DESC_MAX_LIMIT;

  cities$: Observable<string[]>;
  states$: Observable<string[]>;
  teamInfoForm: FormGroup;
  subscriptions = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<TeamsettingsComponent>,
    private snackBarService: SnackbarService,
    private ngFire: AngularFirestore,
    private locationService: LocationService,
    private store: Store<{ team: TeamState; }>,
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
      tslogan: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.bio), Validators.maxLength(this.sloganLimit)]),
      tdesc: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.bio), Validators.maxLength(this.descriptionLimit)]),
      location: new FormGroup({
        locCity: new FormControl(null, Validators.required),
        locState: new FormControl(null, Validators.required),
      }),
      tSocials: new FormGroup({
        ig: new FormControl(null, [Validators.pattern(RegexPatterns.socialProfileLink)]),
        yt: new FormControl(null, [Validators.pattern(RegexPatterns.socialProfileLink)]),
        fb: new FormControl(null, [Validators.pattern(RegexPatterns.socialProfileLink)]),
        tw: new FormControl(null, [Validators.pattern(RegexPatterns.socialProfileLink)]),
      })
    });

  }

  getStates(): void {
    this.states$ = this.locationService.getStateByCountry();
  }

  onSelectState(state: string): void {
    this.cities$ = this.locationService.getCityByState(state);
  }

  onSubmitTeamInfo(): void {
    if (this.teamInfoForm.dirty && this.teamInfoForm.valid) {
      const newDetails: Partial<TeamBasicInfo> = {
        locState: this.teamInfoForm.value.location.locState,
        locCity: this.teamInfoForm.value.location.locCity,
      };
      const newMoreDetails: Partial<TeamMoreInfo> = {
        tslogan: this.teamInfoForm.value.tslogan,
        tdesc: this.teamInfoForm.value.tdesc,
      };
      if (this.teamInfoForm.value.tSocials) {
        newMoreDetails['tSocials'] = this.teamInfoForm.value.tSocials;
      }
      const tid = sessionStorage.getItem('tid');
      if (tid) {
        const allPromises: any = [];
        allPromises.push(this.ngFire.collection('teams/' + tid + '/additionalInfo').doc('moreInfo').update({ ...newMoreDetails, }));
        allPromises.push(this.ngFire.collection('teams').doc(tid).update({ ...newDetails, }));
        Promise.all(allPromises)
          .then(this.onFinishOp.bind(this))
          .catch(() => this.snackBarService.displayError());
      }
    }
  }

  onFinishOp(): void {
    this.snackBarService.displayCustomMsg('Updated Successfully!');
    location.reload();
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

  get socialInfoForm(): FormGroup {
    return this.teamInfoForm.get('tSocials') as FormGroup;
  }
}

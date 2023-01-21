import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { CLOUD_FUNCTIONS } from '@shared/Constants/CLOUD_FUNCTIONS';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { PlayerBasicInfo } from '@shared/interfaces/user.model';
import { ProfileConstants } from '@shared/constants/constants';
import { IFeatureInfoOptions, FeatureInfoComponent } from '@shared/dialogs/feature-info/feature-info.component';
import { RULES } from '@shared/web-content/MATCH-RELATED';
import { ListOption } from '@shared/interfaces/others.model';
import { MatTableDataSource } from '@angular/material/table';
import { ISummaryDataSource } from '@shared/interfaces/season.model';

@Component({
  selector: 'app-teamcreate',
  templateUrl: './teamcreate.component.html',
  styleUrls: ['./teamcreate.component.scss'],
})
export class TeamcreateComponent implements OnInit, OnDestroy {

  teamDetailsForm: FormGroup;
  invitesForm: FormGroup;
  isTeamLive = false;
  isLoaderShown = false;
  teamID: string = null;
  subscriptions = new Subscription();
  playersList: ListOption[] = [];
  memberCount = 0;
  cols = ['label', 'value'];
  summaryDataSource = new MatTableDataSource<ISummaryDataSource>()

  constructor(
    public dialogRef: MatDialogRef<TeamcreateComponent>,
    private ngFire: AngularFirestore,
    private ngFunc: AngularFireFunctions,
    private snackBarService: SnackbarService,
    private ngStorage: AngularFireStorage,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getPlayers();
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  initForm() {
    this.teamDetailsForm = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaNumberWithSpace)], this.validateTNameNotTaken.bind(this)),
      imgpath: new FormControl(null),
      logo: new FormControl(null),
    });
    this.invitesForm = new FormGroup({
      players: new FormArray([])
    });
  }

  onSaveTeamDetails(stepper: MatStepper) {
    if (this.teamDetailsForm.valid) {
      stepper.next();
    }
  }

  onSelectPlayers(stepper: MatStepper) {
    if (this.invitesForm.valid && this.isValidTeamMemberCount) {
      this.createSummary();
      stepper.next();
    }
  }

  createSummary() {
    const teamDetailsFormData = this.teamDetailsForm.valid ? this.teamDetailsForm.value : null;
    const invitesFormData = this.invitesForm.valid ? this.invitesForm.value : null;
    if (teamDetailsFormData && invitesFormData) {
      const data: ISummaryDataSource[] = [];
      const playersListStr: string = (invitesFormData.players as ListOption[])?.map(el => el.value['name'])?.join(', ');
      data.push({ label: 'Team Name', value: teamDetailsFormData['name'], type: 'text' });
      data.push({ label: 'Team Logo', value: this.getImage(teamDetailsFormData['logo']), type: 'icon' });
      data.push({ label: 'Team Photo', value: this.getImage(teamDetailsFormData['imgpath']), type: 'icon' });
      data.push({ label: 'Invited Players', value: playersListStr });
      this.summaryDataSource = new MatTableDataSource(data);
    } else {
      this.snackBarService.displayError('Error creating summary! Try again later');
    }
  }

  async createTeam(): Promise<any> {
    const teamDetailsFormData = this.teamDetailsForm.valid ? this.teamDetailsForm.value : null;
    const invitesFormData = this.invitesForm.valid ? this.invitesForm.value : null;
    const playersList: PlayerBasicInfo[] = invitesFormData ? (invitesFormData?.players as ListOption[])?.map(el => el.value as PlayerBasicInfo) : [];
    const uid = localStorage.getItem('uid');
    const teamName = teamDetailsFormData?.name;

    if (teamDetailsFormData && invitesFormData && playersList && playersList.length >= ProfileConstants.MIN_TEAM_CREATION_ELIGIBLE_PLAYER_LIMIT && teamName) {
      this.isLoaderShown = true;
      const functionData = {
        players: playersList,
        teamName: teamName,
        captainID: uid
      }
      if (teamDetailsFormData['imgpath']) {
        functionData['imgpath'] = await (await this.ngStorage.upload(`/team-photos/${teamName}_${teamDetailsFormData['imgpath']['name']}`, teamDetailsFormData['imgpath'])).ref.getDownloadURL();
      }
      if (teamDetailsFormData['logo']) {
        functionData['logo'] = await (await this.ngStorage.upload(`/team-logos/${teamName}_${teamDetailsFormData['logo']['name']}`, teamDetailsFormData['logo'])).ref.getDownloadURL();
      }
      const callable = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.CREATE_TEAM);
      callable(functionData).toPromise()
        .then(() => this.isTeamLive = true)
        .catch(error => this.snackBarService.displayError('Error Publishing team!'))
        .finally(() => this.isLoaderShown = false)
    } else {
      this.snackBarService.displayError('Error creating team! Try again later');
    }
  }

  getImage(value: any): string {
    if (value) {
      return 'done';
    }
    return 'hide_image';
  }

  onSelectTeamLogo(file: File) {
    this.teamDetailsForm.get('logo').setValue(file);
  }

  onSelectTeamPhoto(file: File) {
    this.teamDetailsForm.get('imgpath').setValue(file);
  }

  getPlayers(): void {
    const uid = localStorage.getItem('uid');
    if (uid) {
      this.subscriptions.add(
        this.ngFire.collection('players', (query) => query.where('team', '==', null)).get()
          .subscribe(response => {
            this.playersList = [];
            if (response && !response.empty) {
              response.docs.forEach(doc => {
                if (doc.exists && doc.id !== uid) {
                  const data = doc.data() as PlayerBasicInfo;
                  const id = doc.id;
                  this.playersList.push({ viewValue: `${data.name} | ${data.pl_pos || 'NA'}`, value: { id, ...data } })
                }
              });
            }
          })
      );
    }
  }

  onAddSelection(option: ListOption): void {
    const formArray = this.players.value as ListOption[];
    if (formArray.findIndex(val => val.value['id'] === option.value['id']) === -1) {
      const control = new FormControl(option);
      this.players.push(control);
      this.memberCount += 1;
    }
  }

  get players(): FormArray {
    return this.invitesForm.get('players') as FormArray;
  }

  get isValidTeamMemberCount(): boolean {
    return this.memberCount >= ProfileConstants.MIN_TEAM_CREATION_ELIGIBLE_PLAYER_LIMIT && this.memberCount < ProfileConstants.MAX_TEAM_ELIGIBLE_PLAYER_LIMIT;
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

  validateTNameNotTaken(control: AbstractControl): Observable<ValidationErrors | null> {
    const teamNameToBeChecked: string = (control.value as string).trim();
    return this.ngFire
      .collection('teams', (query) =>
        query.where('tname', '==', teamNameToBeChecked).limit(1)
      )
      .get()
      .pipe(
        map((responseData) => (responseData.empty ? null : { nameTaken: true }))
      );
  }

  onRemoveSelection(delIndex: number): void {
    this.players.removeAt(delIndex);
    this.memberCount -= 1;
    // this.selectedPlayers.splice(delIndex, 1);
  }

  openRules() {
    const data: IFeatureInfoOptions = {
      heading: 'Freekyk Rules & Regulations',
      description: RULES
    }
    this.dialog.open(FeatureInfoComponent, {
      panelClass: 'large-dialogs',
      data
    })
  }
}

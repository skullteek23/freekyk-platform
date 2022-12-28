import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFireStorage } from '@angular/fire/storage';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { ListOption } from '@shared/components/search-autocomplete/search-autocomplete.component';
import { CLOUD_FUNCTIONS } from '@shared/Constants/CLOUD_FUNCTIONS';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { Invite } from '@shared/interfaces/notification.model';
import { PlayerBasicInfo } from '@shared/interfaces/user.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { MatchConstants, MatchConstantsSecondary } from '@shared/constants/constants';

@Component({
  selector: 'app-teamcreate',
  templateUrl: './teamcreate.component.html',
  styleUrls: ['./teamcreate.component.scss'],
})
export class TeamcreateComponent implements OnInit {

  @ViewChild('stepper') myStepper: MatStepper;

  isStepOneComplete = false;
  isStepTwoComplete = false;
  teamBasicinfoForm: FormGroup;
  newTeamId: string;
  invitesList: Invite[];
  error = false;
  state1 = 'details';
  state2 = 'invites';
  searchPlayer = '';
  success = false;
  players$: Observable<ListOption[]>;
  selectedPlayers: ListOption[] = [];
  noPlayers = false;
  $teamPhoto: File;
  $teamLogo: File;
  imgPath: string = null;
  logoPath: string = null;
  file1Selected = false;
  file2Selected = false;
  filterTerm = '';

  constructor(
    public dialogRef: MatDialogRef<TeamcreateComponent>,
    private ngFire: AngularFirestore,
    private ngFunc: AngularFireFunctions,
    private snackBarService: SnackbarService,
    private ngStorage: AngularFireStorage,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.newTeamId = this.ngFire.createId();
    this.teamBasicinfoForm = new FormGroup({
      tName: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaNumberWithSpace)], this.validateTNameNotTaken.bind(this)),
    });
    this.invitesList = [];
  }

  onCloseDialog(toRoute: boolean = false): void {
    if (toRoute) {
      this.router.navigate(['/dashboard/team-management']);
    }
    this.dialogRef.close();
  }

  onSubmitOne(): void {
    if (this.teamBasicinfoForm.valid) {
      this.isStepOneComplete = true;
      this.myStepper.next();
      this.error = false;
      this.state1 = 'complete';
      this.getPlayers();
    } else {
      this.error = true;
    }
  }

  onSubmitTwo(plSelected: ListOption[]): void {
    this.myStepper.next();
    this.createTeam(this.logoPath, this.imgPath);
    this.createInvites(plSelected.map((sel: ListOption) => ({ name: sel.data.name, id: sel.data.id })));
    this.sendInvites();
    this.state2 = 'complete';
    this.error = false;
    this.isStepTwoComplete = true;
  }

  async createTeam(logo: string, image: string): Promise<any> {
    const uid = localStorage.getItem('uid');
    const FunctionData = {
      newTeamInfo: {
        id: this.newTeamId,
        name: this.teamBasicinfoForm.value.tName,
        logoPath: logo || MatchConstants.DEFAULT_LOGO,
        imgpath: image || MatchConstantsSecondary.DEFAULT_PLACEHOLDER,
      },
      tcaptainId: uid,
    };
    const callable = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.CREATE_TEAM);
    return await callable(FunctionData).toPromise();
  }

  createInvites(selArray: { name: string; id: string }[]): void {
    selArray.forEach((selection) => {
      this.invitesList.push({
        teamId: this.newTeamId,
        teamName: this.teamBasicinfoForm.value.tName,
        inviteeId: selection.id,
        inviteeName: selection.name,
        status: 'wait',
      });
    });
  }

  sendInvites(): void {
    const batch = this.ngFire.firestore.batch();
    for (const invite of this.invitesList) {
      const newId = this.ngFire.createId();
      const colRef = this.ngFire.firestore.collection('invites').doc(newId);
      batch.set(colRef, invite);
    }
    batch
      .commit()
      .then(() => {
        this.success = true;
        this.snackBarService.displayCustomMsg('Invites sent successfully!');
      })
      .catch(() => this.snackBarService.displayError());
    // .catch((error) => console.log(error));
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

  async onChooseTeamImage(ev: any): Promise<any> {
    this.$teamPhoto = ev.target.files[0];
    this.imgPath = await (
      await this.ngStorage.upload(
        '/teamPictures' + Math.random() + this.$teamPhoto.name,
        this.$teamPhoto
      )
    ).ref.getDownloadURL();
    this.file1Selected = true;
  }

  async onChooseTeamLogoImage(ev: any): Promise<any> {
    this.$teamLogo = ev.target.files[0];
    this.logoPath = await (
      await this.ngStorage.upload(
        '/teamLogos' + Math.random() + this.$teamLogo.name,
        this.$teamLogo
      )
    ).ref.getDownloadURL();
    this.file2Selected = true;
  }

  getPlayers(): void {
    const uid = localStorage.getItem('uid');
    this.players$ = this.ngFire
      .collection('players', (query) => query.where('team', '==', null))
      .snapshotChanges()
      .pipe(
        tap((resp) => (this.noPlayers = resp.length === 0)),
        map((docs) => {
          const listOptions: ListOption[] = [];
          docs.forEach(doc => {
            const playerData = doc.payload.doc.data() as PlayerBasicInfo;
            const id = doc.payload.doc.id;
            if (id !== uid) {
              listOptions.push({
                viewValue: `${playerData.name} | ${playerData.pl_pos || 'NA'}`,
                data: ({ id, ...playerData } as PlayerBasicInfo)
              });
            }
          });
          return listOptions;
        }),
        share()
      );
  }

  onAddSelection(value: ListOption): void {
    if (this.selectedPlayers.findIndex(player => player.viewValue === value.viewValue) === -1) {
      this.selectedPlayers.push(value);
      this.selectedPlayers.sort(ArraySorting.sortObjectByKey('viewValue'))
    }
  }

  onRemoveSelection(delIndex: number): void {
    this.selectedPlayers.splice(delIndex, 1);
  }
}

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
import { MatListOption } from '@angular/material/list';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { Invite } from '../../../shared/interfaces/notification.model';
import { PlayerBasicInfo } from '../../../shared/interfaces/user.model';

@Component({
  selector: 'app-teamcreate',
  templateUrl: './teamcreate.component.html',
  styleUrls: ['./teamcreate.component.css'],
})
export class TeamcreateComponent implements OnInit {
  @ViewChild('stepper') myStepper: MatStepper;
  teamBasicinfoForm: FormGroup;
  newTeamId: string;
  invitesList: Invite[];
  error = false;
  state1 = 'details';
  state2 = 'invites';
  search_player: string = '';
  success = false;
  players$: Observable<PlayerBasicInfo[]>;
  noPlayers: boolean = false;
  $teamPhoto: File;
  $teamLogo: File;
  imgPath: string = null;
  logoPath: string = null;
  file1Selected: boolean = false;
  file2Selected: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<TeamcreateComponent>,
    private ngFire: AngularFirestore,
    private ngFunc: AngularFireFunctions,
    private snackServ: SnackbarService,
    private ngStorage: AngularFireStorage,
    private router: Router
  ) {
    this.newTeamId = this.ngFire.createId();
    this.teamBasicinfoForm = new FormGroup({
      tName: new FormControl(
        null,
        [Validators.required, Validators.pattern(/^[0-9a-zA-Z ]+$/)],
        this.validateTNameNotTaken.bind(this)
      ),
    });
    this.invitesList = [];
  }
  ngOnInit(): void {}
  onCloseDialog(toRoute: boolean = false) {
    if (toRoute) this.router.navigate(['/dashboard/team-management']);
    this.dialogRef.close();
  }
  onSubmitOne() {
    this.myStepper.next();
    if (
      this.teamBasicinfoForm.valid &&
      this.$teamPhoto != null &&
      this.$teamLogo != null
    ) {
      this.error = false;
      this.state1 = 'complete';
      this.getPlayers();
    } else this.error = true;
  }
  onSubmitTwo(plSelected: MatListOption[]) {
    this.myStepper.next();
    !this.file1Selected || !this.file2Selected
      ? this.createTeam(this.getDefaultTLogo(), this.getDefaultTPhoto())
      : this.createTeam(this.logoPath, this.imgPath);
    this.createInvites(plSelected.map((sel) => sel.value));
    this.sendInvites();
    this.state2 = 'complete';
    this.error = false;
  }
  async createTeam(logo: string, image: string) {
    // this.ngFunc.useFunctionsEmulator('http://localhost:5001');
    const uid = localStorage.getItem('uid');

    const FunctionData = {
      newTeamInfo: {
        id: this.newTeamId,
        name: this.teamBasicinfoForm.value.tName,
        imgpath: image,
        logoPath: logo,
      },
      tcaptainId: uid,
    };
    const callable = this.ngFunc.httpsCallable('createTeam');
    return await callable(FunctionData).toPromise();
  }
  createInvites(selArray: { name: string; id: string }[]) {
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
  sendInvites() {
    var batch = this.ngFire.firestore.batch();
    for (let i = 0; i < this.invitesList.length; i++) {
      const newId = this.ngFire.createId();
      const colRef = this.ngFire.firestore.collection('invites').doc(newId);
      batch.set(colRef, this.invitesList[i]);
    }
    batch
      .commit()
      .then(() => {
        this.success = true;
        this.snackServ.displayCustomMsg('Invites sent successfully!');
      })
      .catch((error) => console.log(error));
  }
  validateTNameNotTaken(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    let teamNameToBeChecked: string = (<String>control.value).trim();
    return this.ngFire
      .collection('teams', (query) =>
        query.where('tname', '==', teamNameToBeChecked).limit(1)
      )
      .get()
      .pipe(
        map((responseData) => {
          if (responseData.empty) return null;
          else return { nameTaken: true };
        })
      );
  }
  async onChooseTeamImage(ev: any) {
    this.$teamPhoto = ev.target.files[0];
    this.imgPath = await (
      await this.ngStorage.upload(
        '/teamPictures' + Math.random() + this.$teamPhoto.name,
        this.$teamPhoto
      )
    ).ref.getDownloadURL();
    this.file1Selected = true;
  }
  async onChooseTeamLogoImage(ev: any) {
    this.$teamLogo = ev.target.files[0];
    this.logoPath = await (
      await this.ngStorage.upload(
        '/teamLogos' + Math.random() + this.$teamLogo.name,
        this.$teamLogo
      )
    ).ref.getDownloadURL();
    this.file2Selected = true;
  }
  getDefaultTPhoto() {
    return 'https://firebasestorage.googleapis.com/v0/b/freekyk7.appspot.com/o/fcp.png?alt=media&token=4b023705-d0d5-4685-96e8-21aed5121e40';
  }
  getDefaultTLogo() {
    return 'https://firebasestorage.googleapis.com/v0/b/freekyk7.appspot.com/o/Logo%20Mark%20Color.png?alt=media&token=ee3beb32-f6b7-4ef8-a226-59d86705d9d4';
  }
  getPlayers() {
    const uid = localStorage.getItem('uid');
    this.players$ = this.ngFire
      .collection('players', (query) => query.where('team', '==', null))
      .snapshotChanges()
      .pipe(
        tap((resp) => (this.noPlayers = resp.length == 0)),
        map((docs) =>
          docs.map(
            (doc) =>
              <PlayerBasicInfo>{
                id: doc.payload.doc.id,
                ...(<PlayerBasicInfo>doc.payload.doc.data()),
              }
          )
        ),
        map((docs) => docs.filter((doc) => doc.id != uid))
      );
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MatDialogRef } from '@angular/material/dialog';
import { MatListOption } from '@angular/material/list';
import { MatStepper } from '@angular/material/stepper';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { CLOUD_FUNCTIONS } from 'src/app/shared/Constants/CLOUD_FUNCTIONS';
import { TeamBasicInfo } from '../../../shared/interfaces/team.model';

@Component({
  selector: 'app-teamjoin',
  templateUrl: './teamjoin.component.html',
  styleUrls: ['./teamjoin.component.css'],
})
export class TeamjoinComponent implements OnInit {
  @ViewChild('stepper') private myStepper: MatStepper;
  teamsList$: Observable<TeamBasicInfo[]>;
  noTeams = false;
  moreSel = true;
  error = false;
  state = 'requests';
  success = false;
  filterTerm = '';
  isStepOneComplete = false;
  constructor(
    public dialogRef: MatDialogRef<TeamjoinComponent>,
    private ngFire: AngularFirestore,
    private ngFunc: AngularFireFunctions,
    private snackServ: SnackbarService
  ) { }
  ngOnInit(): void {
    this.getTeams();
  }
  onCloseDialog(): void {
    this.dialogRef.close();
  }
  onSubmit(plSelected: MatListOption[]): void {
    this.myStepper.next();
    this.isStepOneComplete = true;
    const capIds: string[] = plSelected.map((sel) => sel.value);
    // console.log(capIds);
    const userName = sessionStorage.getItem('name');
    if (this.sendRequests(capIds, userName)) {
      this.state = 'complete';
      this.success = true;
      this.error = false;
      this.snackServ.displayCustomMsg('Requests sent successfully!');
    }
  }
  async sendRequests(capIds: string[], playerName: string): Promise<any> {
    const FunctionData = {
      capId: capIds,
      name: playerName,
    };
    // console.log(FunctionData);
    const callable = this.ngFunc.httpsCallable(
      CLOUD_FUNCTIONS.SEND_JOIN_REQUEST_TO_TEAMS
    );
    return await callable(FunctionData).toPromise();
  }
  getTeams(): void {
    this.teamsList$ = this.ngFire
      .collection('teams')
      .snapshotChanges()
      .pipe(
        map((responseData) => {
          if (responseData.length === 0) {
            this.noTeams = true;
            return null;
          }
          this.noTeams = false;
          return responseData.map(
            (data) =>
            ({
              id: data.payload.doc.id,
              ...(data.payload.doc.data() as TeamBasicInfo),
            } as TeamBasicInfo)
          );
        }),
        share()
      );
  }
}

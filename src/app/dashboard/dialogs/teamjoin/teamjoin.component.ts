import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { ListOption } from '@shared/components/search-autocomplete/search-autocomplete.component';
import { CLOUD_FUNCTIONS } from '@shared/Constants/CLOUD_FUNCTIONS';
import { TeamBasicInfo } from '@shared/interfaces/team.model';

@Component({
  selector: 'app-teamjoin',
  templateUrl: './teamjoin.component.html',
  styleUrls: ['./teamjoin.component.css'],
})
export class TeamjoinComponent implements OnInit {
  @ViewChild('stepper') private myStepper: MatStepper;
  teamsList$: Observable<ListOption[]>;
  selectedTeams: ListOption[] = [];
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
  onSubmit(plSelected: ListOption[]): void {
    this.myStepper.next();
    this.isStepOneComplete = true;
    const capIds: string[] = plSelected.map((sel) => (sel.data as TeamBasicInfo).captainId);
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
        tap((resp) => (this.noTeams = resp.length === 0)),
        map((docs) => {
          const listOptions: ListOption[] = [];
          docs.forEach(doc => {
            const teamData = doc.payload.doc.data() as TeamBasicInfo;
            const id = doc.payload.doc.id;
            listOptions.push({
              viewValue: teamData.tname,
              data: ({ id, ...teamData } as TeamBasicInfo)
            });
          });
          return listOptions;
        })
      );
  }

  onAddSelection(value: ListOption): void {
    if (this.selectedTeams.findIndex(team => team.viewValue === value.viewValue) === -1) {
      this.selectedTeams.push(value);
    }
  }
  onRemoveSelection(delIndex: number): void {
    this.selectedTeams.splice(delIndex, 1);
  }
}

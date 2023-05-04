import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { CLOUD_FUNCTIONS } from '@shared/constants/CLOUD_FUNCTIONS';
import { TeamBasicInfo } from '@shared/interfaces/team.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { FeatureInfoComponent, IFeatureInfoOptions } from '@shared/dialogs/feature-info/feature-info.component';
import { RULES } from '@shared/web-content/MATCH-RELATED';
import { ListOption } from '@shared/interfaces/others.model';
import { IActionShortcutData } from '@shared/components/action-shortcut-button/action-shortcut-button.component';
import { TeamService } from '@app/services/team.service';

@Component({
  selector: 'app-teamjoin',
  templateUrl: './teamjoin.component.html',
  styleUrls: ['./teamjoin.component.scss'],
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

  shortcutData: IActionShortcutData;

  constructor(
    public dialogRef: MatDialogRef<TeamjoinComponent>,
    private ngFire: AngularFirestore,
    private ngFunc: AngularFireFunctions,
    private snackBarService: SnackbarService,
    private dialog: MatDialog,
    private teamService: TeamService
  ) { }

  ngOnInit(): void {
    this.getTeams();
    // this.shortcutData = {
    //   icon: 'add_circle',
    //   actionLabel: 'Create your own team',

    // }
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

  onSubmit(selection: ListOption[]): void {
    this.myStepper.next();
    this.isStepOneComplete = true;
    const teamCaptainsList: ListOption[] = selection.map(el => {
      const teamInfo = el.value as TeamBasicInfo;
      const viewValue = teamInfo.captainName;
      const value = teamInfo.captainId;
      return ({ value, viewValue })
    })
    const userName = sessionStorage.getItem('name');
    if (this.sendRequests(teamCaptainsList, userName)) {
      this.state = 'complete';
      this.success = true;
      this.error = false;
      this.snackBarService.displayCustomMsg('Requests sent successfully!');
    }
  }

  async sendRequests(capIds: ListOption[], playerName: string): Promise<any> {
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
              value: ({ id, ...teamData } as TeamBasicInfo)
            });
          });
          return listOptions;
        })
      );
  }

  onAddSelection(value: ListOption): void {
    if (this.selectedTeams.findIndex(team => team.viewValue === value.viewValue) === -1) {
      this.selectedTeams.push(value);
      this.selectedTeams.sort(ArraySorting.sortObjectByKey('viewValue'))
    }
  }

  onRemoveSelection(delIndex: number): void {
    this.selectedTeams.splice(delIndex, 1);
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

  onOpenTeamCreate() {
    this.teamService.onOpenCreateTeamDialog();
  }
}

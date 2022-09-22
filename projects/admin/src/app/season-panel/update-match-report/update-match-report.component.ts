import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { MatchFixture, ReportSummary } from 'src/app/shared/interfaces/match.model';
import { ListOption } from 'src/app/shared/interfaces/others.model';
import { TeamMembers } from 'src/app/shared/interfaces/team.model';
import { MatchConstants } from '../../shared/constants/constants';
import { ChipSelectionInputComponent } from '../chip-selection-input/chip-selection-input.component';

@Component({
  selector: 'app-update-match-report',
  templateUrl: './update-match-report.component.html',
  styleUrls: ['./update-match-report.component.css']
})
export class UpdateMatchReportComponent implements OnInit {

  fixture: MatchFixture;
  isLoaderShown = false;
  isViewSummary = false;
  matchReportForm: FormGroup;
  homeTeamPlayersList: ListOption[] = [];
  awayTeamPlayersList: ListOption[] = [];
  scorersList: ListOption[] = [];
  reportSummary = new ReportSummary();

  @ViewChild('scorerSelection') chipSelectionInputComponent: ChipSelectionInputComponent;

  constructor(
    public dialogRef: MatDialogRef<UpdateMatchReportComponent>,
    private ngFire: AngularFirestore,
    private snackbarService: SnackbarService,
    @Inject(MAT_DIALOG_DATA) public data: string,
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getMatchInfo();
  }

  getMatchInfo(): void {
    this.isLoaderShown = true;
    this.ngFire.collection('allMatches').doc(this.data).get().pipe(map(resp => resp.data() as MatchFixture)).subscribe(data => {
      if (data && data.date > new Date().getTime() && data.concluded === false) {
        this.fixture = data;
        this.getInvolvedPlayersList();
      } else if (data && data.concluded === false) {
        this.isLoaderShown = false;
        this.snackbarService.displayCustomMsg('Match data already submitted!');
        this.onCloseDialog();
      } else {
        this.isLoaderShown = false;
        this.snackbarService.displayCustomMsg('Match day has not occurred yet!');
        this.onCloseDialog();
      }
    })
  }

  async getInvolvedPlayersList() {
    const homeTeamID = await this.getTeamInfo(this.fixture?.home?.name)?.toPromise();
    const homeMembers = await this.getMemberInfo(homeTeamID)?.toPromise();
    const awayTeamID = await this.getTeamInfo(this.fixture?.home?.name)?.toPromise();
    const awayMembers = await this.getMemberInfo(awayTeamID)?.toPromise();
    if (!homeMembers || !homeMembers.length || !awayMembers || !awayMembers.length) {
      this.isLoaderShown = false;
      this.snackbarService.displayCustomMsg('Unable to get team members!');
      this.onCloseDialog();
      return;
    }
    if (homeMembers && homeMembers.length) {
      for (let k = 0; k < homeMembers.length; k++) {
        this.homeTeamPlayersList.push({
          viewValue: homeMembers[k].name,
          value: homeMembers[k].id
        });
      }
    }
    if (awayMembers && awayMembers.length) {
      for (let k = 0; k < awayMembers.length; k++) {
        this.awayTeamPlayersList.push({
          viewValue: awayMembers[k].name,
          value: awayMembers[k].id
        });
      }
    }
    this.isLoaderShown = false;
  }

  getTeamInfo(name: string): Observable<any> {
    if (name) {
      return this.ngFire.collection('teams', query => query.where('tname', '==', name)).get().pipe(map(resp => resp?.docs[0]?.id));
    }
  }

  getMemberInfo(teamID: string): Observable<any> {
    if (teamID) {
      return this.ngFire.collection(`teams/${teamID}/additionalInfo`).doc('members').get().pipe(map(resp => (resp?.data() as TeamMembers)?.members));
    }
  }

  onSelectBillFileUpload(file) {
    this.matchReportForm.get('billsFile').setValue(file);
  }

  onSelectReportFileUpload(file) {
    this.matchReportForm.get('matchReportFile').setValue(file);
  }

  initForm(): void {
    this.matchReportForm = new FormGroup({
      homeScore: new FormControl(0, [Validators.required]),
      awayScore: new FormControl(0, [Validators.required]),
      penalties: new FormControl(0),
      homePenScore: new FormControl(0, [Validators.required]),
      awayPenScore: new FormControl(0, [Validators.required]),
      scorers: new FormArray([]),
      scorersGoals: new FormArray([]),
      redCardHoldersHome: new FormArray([]),
      redCardHoldersAway: new FormArray([]),
      yellowCardHoldersHome: new FormArray([]),
      yellowCardHoldersAway: new FormArray([]),
      billsFile: new FormControl(null, [Validators.required]),
      matchReportFile: new FormControl(null, [Validators.required]),
      moneySpent: new FormControl(0, [Validators.required]),
      referee: new FormControl(null, [Validators.required]),
      specialNotes: new FormControl(null),
    });
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

  onAdd(ev: ListOption[], controlName: string): void {
    (this.matchReportForm.get(controlName) as FormArray).clear();
    for (let i = 0; i < ev.length; i++) {
      const control = new FormControl(ev[i]);
      (this.matchReportForm.get(controlName) as FormArray).push(control);
    }
    if (controlName === 'scorers') {
      this.onAddScorer();
    }
  }

  onAddScorer() {
    const control = new FormControl(1, [Validators.required]);
    this.scorersGoals.push(control);
  }

  onGenerateSummary() {
    if (this.isViewSummary || this.matchReportForm.invalid) {
      return;
    }
    this.isViewSummary = true;
    this.assignSummary();
  }

  onSubmitMatchReport() {
    //
  }

  assignSummary(): void {
    // Tournaments
    const incrementUpdate = '+1';
    const FPL_UPDATE = this.fixture.type === 'FPL' ? incrementUpdate : MatchConstants.LABEL_NOT_AVAILABLE;
    const FKC_UPDATE = this.fixture.type === 'FKC' ? incrementUpdate : MatchConstants.LABEL_NOT_AVAILABLE;
    const FCP_UPDATE = this.fixture.type === 'FCP' ? incrementUpdate : MatchConstants.LABEL_NOT_AVAILABLE;

    // Cards
    const redCardHome = this.redCardHoldersHome.length > 0 ? `+${this.redCardHoldersHome.length}` : MatchConstants.LABEL_NOT_AVAILABLE;
    const redCardAway = this.redCardHoldersAway.length > 0 ? `+${this.redCardHoldersAway.length}` : MatchConstants.LABEL_NOT_AVAILABLE;
    const redCardPlayersHome: string[] = this.redCardHoldersHome.value ? this.redCardHoldersHome.value.map((el: ListOption) => el.viewValue) : [];
    const redCardPlayersAway: string[] = this.redCardHoldersAway.value ? this.redCardHoldersAway.value.map((el: ListOption) => el.viewValue) : [];
    const redCardTotal = (this.redCardHoldersHome.length + this.redCardHoldersAway.length) > 0 ? `+${(this.redCardHoldersHome.length + this.redCardHoldersAway.length)}` : MatchConstants.LABEL_NOT_AVAILABLE;
    let allRedCardPlayerList = (redCardPlayersHome.concat(redCardPlayersAway)).join(", ");
    if (!redCardPlayersHome.length && !redCardPlayersAway.length) {
      allRedCardPlayerList = MatchConstants.LABEL_NOT_AVAILABLE;
    }
    const yellowCardHome = this.yellowCardHoldersHome.length > 0 ? `+${this.yellowCardHoldersHome.length}` : MatchConstants.LABEL_NOT_AVAILABLE;
    const yellowCardAway = this.yellowCardHoldersAway.length > 0 ? `+${this.yellowCardHoldersAway.length}` : MatchConstants.LABEL_NOT_AVAILABLE;
    const yellowCardPlayersHome: string[] = this.yellowCardHoldersHome.value ? this.yellowCardHoldersHome.value.map((el: ListOption) => el.viewValue) : [];
    const yellowCardPlayersAway: string[] = this.yellowCardHoldersAway.value ? this.yellowCardHoldersAway.value.map((el: ListOption) => el.viewValue) : [];
    const yellowCardTotal = (this.yellowCardHoldersHome.length + this.yellowCardHoldersAway.length) > 0 ? `+${(this.yellowCardHoldersHome.length + this.yellowCardHoldersAway.length)}` : MatchConstants.LABEL_NOT_AVAILABLE;
    let allYellowCardPlayerList = (yellowCardPlayersHome.concat(yellowCardPlayersAway)).join(", ");
    if (!yellowCardPlayersHome.length && !yellowCardPlayersAway.length) {
      allYellowCardPlayerList = MatchConstants.LABEL_NOT_AVAILABLE;
    }

    // Goals & Players
    let highestScorer = MatchConstants.LABEL_NOT_AVAILABLE;
    let winnersList = MatchConstants.LABEL_NOT_AVAILABLE;
    const homeWin = this.homeGoals > this.awayGoals ? incrementUpdate : MatchConstants.LABEL_NOT_AVAILABLE;
    const awayWin = this.awayGoals > this.homeGoals ? incrementUpdate : MatchConstants.LABEL_NOT_AVAILABLE;
    const homeGoals = this.homeGoals > 0 ? `+${this.homeGoals}` : MatchConstants.LABEL_NOT_AVAILABLE;
    const awayGoals = this.awayGoals > 0 ? `+${this.awayGoals}` : MatchConstants.LABEL_NOT_AVAILABLE;
    const goalsTotal = this.totalGoals > 0 ? `+${this.totalGoals}` : MatchConstants.LABEL_NOT_AVAILABLE;
    const playersList = this.matchDayPlayersList.length ? this.matchDayPlayersList.map(el => el.viewValue).join(", ") : MatchConstants.LABEL_NOT_AVAILABLE;
    const scorersListTemp: ListOption[] = this.scorers.value;
    const scorersList = scorersListTemp.length ? scorersListTemp.map(el => el.viewValue).join(", ") : MatchConstants.LABEL_NOT_AVAILABLE;
    const goalsList: number[] = this.scorersGoals.value;
    const index: number = goalsList.findIndex(val => val === Math.max(...goalsList));
    if (index > -1 && scorersListTemp.length) {
      highestScorer = scorersListTemp[index].viewValue;
    }
    if (this.homeGoals > this.awayGoals) {
      winnersList = this.homeTeamPlayersList.map(el => el.viewValue).join(", ");
    } else if (this.awayGoals > this.homeGoals) {
      winnersList = this.awayTeamPlayersList.map(el => el.viewValue).join(", ");
    }
    const cols = {
      season: [
        {
          viewValue: 'Data Points',
          value: 'point'
        },
        {
          viewValue: 'Season Stats Update',
          value: 'update'
        }
      ],
      team: [
        {
          viewValue: 'Data Points',
          value: 'point'
        },
        {
          viewValue: 'Team Stats Update (Home)',
          value: 'home'
        },
        {
          viewValue: 'Team Stats Update (Away)',
          value: 'away'
        }
      ],
      player: [
        {
          viewValue: 'Data Points',
          value: 'pointTwo'
        },
        {
          viewValue: 'Applied to',
          value: 'applied',
        },
        {
          viewValue: 'Player Stats Update',
          value: 'updateTwo',
        }
      ]
    }
    const dataSource = {
      season: [
        {
          point: MatchConstants.STATISTICS.TOTAL_GOALS,
          update: goalsTotal
        },
        {
          point: MatchConstants.STATISTICS.FPL_PLAYED,
          update: FPL_UPDATE
        },
        {
          point: MatchConstants.STATISTICS.FKC_PLAYED,
          update: FKC_UPDATE
        },
        {
          point: MatchConstants.STATISTICS.FCP_PLAYED,
          update: FCP_UPDATE
        },
        {
          point: MatchConstants.STATISTICS.TOTAL_RED_CARDS,
          update: redCardTotal
        },
        {
          point: MatchConstants.STATISTICS.TOTAL_YELLOW_CARDS,
          update: yellowCardTotal
        },
        {
          point: MatchConstants.STATISTICS.HIGHEST_GOALSCORER,
          update: highestScorer
        },
      ],
      team: [
        {
          point: MatchConstants.STATISTICS.FPL_PLAYED,
          home: FPL_UPDATE,
          away: FPL_UPDATE,
        },
        {
          point: MatchConstants.STATISTICS.FKC_PLAYED,
          home: FKC_UPDATE,
          away: FKC_UPDATE,
        },
        {
          point: MatchConstants.STATISTICS.FCP_PLAYED,
          home: FCP_UPDATE,
          away: FCP_UPDATE,
        },
        {
          point: MatchConstants.STATISTICS.GOALS,
          home: homeGoals,
          away: awayGoals
        },
        {
          point: MatchConstants.STATISTICS.WINS,
          home: homeWin,
          away: awayWin
        },
        {
          point: MatchConstants.STATISTICS.LOSSES,
          home: awayWin,
          away: homeWin,
        },
        {
          point: MatchConstants.STATISTICS.RED_CARDS,
          home: redCardHome,
          away: redCardAway
        },
        {
          point: MatchConstants.STATISTICS.YELLOW_CARDS,
          home: yellowCardHome,
          away: yellowCardAway
        },
        {
          point: MatchConstants.STATISTICS.GOALS_CONCEDED,
          home: awayGoals,
          away: homeGoals
        },
      ],
      player: [
        {
          pointTwo: MatchConstants.STATISTICS.APPEARANCES,
          applied: playersList,
          updateTwo: incrementUpdate,
        },
        {
          pointTwo: MatchConstants.STATISTICS.GOALS,
          applied: scorersList,
          updateTwo: scorersListTemp.length ? incrementUpdate : MatchConstants.LABEL_NOT_AVAILABLE,
        },
        {
          pointTwo: MatchConstants.STATISTICS.WINS,
          applied: winnersList,
          updateTwo: winnersList !== MatchConstants.LABEL_NOT_AVAILABLE ? incrementUpdate : MatchConstants.LABEL_NOT_AVAILABLE,
        },
        {
          pointTwo: MatchConstants.STATISTICS.RED_CARDS,
          applied: allRedCardPlayerList,
          updateTwo: allRedCardPlayerList !== MatchConstants.LABEL_NOT_AVAILABLE ? incrementUpdate : MatchConstants.LABEL_NOT_AVAILABLE,
        },
        {
          pointTwo: MatchConstants.STATISTICS.YELLOW_CARDS,
          applied: allYellowCardPlayerList,
          updateTwo: allYellowCardPlayerList !== MatchConstants.LABEL_NOT_AVAILABLE ? incrementUpdate : MatchConstants.LABEL_NOT_AVAILABLE,
        },
      ]
    }

    for (const prop in cols) {
      this.reportSummary[prop] = {
        cols: cols[prop].map(el => el.value),
        displayCols: cols[prop],
        dataSource: dataSource[prop]
      }
    }
  }

  get scorersGoals(): FormArray {
    return this.matchReportForm.get('scorersGoals') as FormArray;
  }

  get scorers(): FormArray {
    return this.matchReportForm.get('scorers') as FormArray;
  }

  get totalGoals(): number {
    return (this.homeGoals + this.awayGoals);
  }

  get homeGoals(): number {
    return (+this.matchReportForm.get('homeScore')?.value);
  }

  get awayGoals(): number {
    return (+this.matchReportForm.get('awayScore')?.value);
  }

  get chipSelectionList() {
    return this.chipSelectionInputComponent && this.chipSelectionInputComponent.list ? this.chipSelectionInputComponent.list : []
  }

  get redCardHoldersAway(): FormArray {
    return this.matchReportForm.get('redCardHoldersAway') as FormArray;
  }

  get yellowCardHoldersAway(): FormArray {
    return this.matchReportForm.get('yellowCardHoldersAway') as FormArray;
  }

  get redCardHoldersHome(): FormArray {
    return this.matchReportForm.get('redCardHoldersHome') as FormArray;
  }

  get yellowCardHoldersHome(): FormArray {
    return this.matchReportForm.get('yellowCardHoldersHome') as FormArray;
  }

  get matchDayPlayersList(): ListOption[] {
    if (this.homeTeamPlayersList && this.awayTeamPlayersList) {
      return this.homeTeamPlayersList.concat(this.awayTeamPlayersList);
    }
    return [];
  }
}

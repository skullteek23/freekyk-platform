import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { ALPHA_W_SPACE, BIO, NUM } from 'src/app/shared/Constants/REGEX';
import { CloudFunctionStatsData, MatchFixture, ReportSummary, TournamentTypes } from 'src/app/shared/interfaces/match.model';
import { ListOption } from 'src/app/shared/interfaces/others.model';
import { TeamMembers } from 'src/app/shared/interfaces/team.model';
import { MatchConstants, STATISTICS } from '../../shared/constants/constants';
import { FormsMessages, MatchReportMessages } from '../../shared/constants/messages';
import { ChipSelectionInputComponent } from '../chip-selection-input/chip-selection-input.component';
import { SeasonAdminService } from '../season-admin.service';

export type HOME_AWAY = 'home' | 'away';
export interface IStatHolder {
  team: HOME_AWAY;
  value: string;
}
export class IStatHolderEntity {
  season: ListOption[] = [];
  team: ListOption[] = [];
  player: ListOption[] = [];
}
export class IStatHolderEntityGeneric {
  season: any[] = [];
  team: any[] = [];
  player: any[] = [];
}

@Component({
  selector: 'app-update-match-report',
  templateUrl: './update-match-report.component.html',
  styleUrls: ['./update-match-report.component.css']
})
export class UpdateMatchReportComponent implements OnInit {

  readonly messages = MatchReportMessages;

  AWAY_TEAM = '';
  awayTeamPlayersList: ListOption[] = [];
  fixture: MatchFixture;
  formMessages = FormsMessages;
  HOME_TEAM = '';
  homeTeamPlayersList: ListOption[] = [];
  isLoaderShown = false;
  isShowSummary = false;
  matchReportForm: FormGroup;
  reportSummary: ReportSummary;
  scorersList: ListOption[] = [];
  updateStats: CloudFunctionStatsData;

  @ViewChild('scorerSelectionHome') chipSelectionInputComponentHome: ChipSelectionInputComponent;
  @ViewChild('scorerSelectionAway') chipSelectionInputComponentAway: ChipSelectionInputComponent;

  constructor(
    public dialogRef: MatDialogRef<UpdateMatchReportComponent>,
    private ngFire: AngularFirestore,
    private snackbarService: SnackbarService,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private seasonAdminService: SeasonAdminService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getMatchInfo();
  }

  initForm(): void {
    this.matchReportForm = new FormGroup({
      homeScore: new FormControl(0, [Validators.required, Validators.pattern(NUM)]),
      awayScore: new FormControl(0, [Validators.required, Validators.pattern(NUM)]),
      penalties: new FormControl(0),
      homePenScore: new FormControl(null, [Validators.pattern(NUM), Validators.min(1), this.isHomeEqualScoreValidator.bind(this)]),
      awayPenScore: new FormControl(null, [Validators.pattern(NUM), Validators.min(1), this.isAwayEqualScoreValidator.bind(this)]),
      scorersHome: new FormArray([]),
      scorersAway: new FormArray([]),
      scorersGoalsHome: new FormArray([]),
      scorersGoalsAway: new FormArray([]),
      redCardHoldersHome: new FormArray([]),
      redCardHoldersAway: new FormArray([]),
      yellowCardHoldersHome: new FormArray([]),
      yellowCardHoldersAway: new FormArray([]),
      billsFile: new FormControl(null),
      matchReportFile: new FormControl(null, [Validators.required]),
      moneySpent: new FormControl(0, [Validators.required, Validators.pattern(NUM)]),
      referee: new FormControl(null, [Validators.required, Validators.pattern(ALPHA_W_SPACE)]),
      specialNotes: new FormControl(null, [Validators.pattern(BIO), Validators.maxLength(200)]),
    });
  }

  getMatchInfo(): void {
    this.isLoaderShown = true;
    this.ngFire.collection('allMatches').doc(this.data).get().pipe(map(resp => resp.data() as MatchFixture)).subscribe(data => {
      if (data && data.date < new Date().getTime() && data.concluded === false) {
        this.fixture = data;
        this.HOME_TEAM = this.fixture?.home?.name;
        this.AWAY_TEAM = this.fixture?.away?.name;
        this.getInvolvedPlayersList();
      } else if (data && data.concluded === true) {
        this.isLoaderShown = false;
        this.snackbarService.displayError('Match data already submitted!');
        this.onCloseDialog();
      } else {
        this.isLoaderShown = false;
        this.snackbarService.displayError('Match day has not occurred yet!');
        this.onCloseDialog();
      }
    })
  }

  isAwayEqualScoreValidator(control: AbstractControl): ValidationErrors {
    if (control.value === this.homePenScore?.value) {
      return { notEqual: true };
    }
    this.homePenScore?.markAsUntouched();
    return null;
  }

  isHomeEqualScoreValidator(control: AbstractControl): ValidationErrors {
    if (control.value === this.awayPenScore?.value) {
      return { notEqual: true };
    }
    this.awayPenScore?.markAsUntouched();
    return null;
  }

  async getInvolvedPlayersList() {
    const homeTeamID = await this.getTeamInfo(this.fixture?.home?.name)?.toPromise();
    const homeMembers = await this.getMemberInfo(homeTeamID)?.toPromise();
    const awayTeamID = await this.getTeamInfo(this.fixture?.away?.name)?.toPromise();
    const awayMembers = await this.getMemberInfo(awayTeamID)?.toPromise();
    if (!homeMembers || !homeMembers.length || !awayMembers || !awayMembers.length) {
      this.isLoaderShown = false;
      this.snackbarService.displayError('Unable to get team members!');
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

  onCloseDialog(): void {
    this.dialogRef.close();
  }

  onAdd(ev: ListOption[], controlName: string): void {
    (this.matchReportForm.get(controlName) as FormArray).clear();
    for (let i = 0; i < ev.length; i++) {
      const control = new FormControl(ev[i]);
      (this.matchReportForm.get(controlName) as FormArray).push(control);
    }

    const control = new FormControl(1, [Validators.required, Validators.pattern(NUM), Validators.min(1), Validators.max(this.totalGoals)]);
    if (controlName === 'scorersHome') {
      this.scorersGoalsHome.push(control);
    } else if (controlName === 'scorersAway') {
      this.scorersGoalsAway.push(control);
    }
  }

  onGenerateSummary() {
    if (this.matchReportForm.invalid) {
      this.matchReportForm.markAllAsTouched();
      return;
    }
    this.isShowSummary = true;
    this.assignSummary();
  }

  onSubmitMatchReport() {
    // on submit details
    if (this.matchReportForm.valid) {
      this.isLoaderShown = true;
      const fixture: MatchFixture = {
        ...this.fixture,
        id: this.data
      }
      this.seasonAdminService.updateMatchReport(this.matchReportForm.value, fixture, this.homeTeamPlayersList, this.awayTeamPlayersList)
        .then(() => {
          this.snackbarService.displayCustomMsg('Match report will be updated shortly!');
          this.isLoaderShown = false;
          this.onCloseDialog();
        })
        .catch(() => {
          this.isLoaderShown = false;
          this.snackbarService.displayError('Unable to update match');
        });
    }
  }

  assignSummary(): void {

    // Red Card Holders
    const redCardHoldersAll: IStatHolder[] = [];
    const redCardHoldersH: IStatHolder[] = this.parseFormArrayList(this.redCardHoldersHome.value, 'home');
    const redCardHoldersA: IStatHolder[] = this.parseFormArrayList(this.redCardHoldersAway.value, 'away');
    redCardHoldersAll.push(...redCardHoldersH, ...redCardHoldersA);

    // Yellow Card Holders
    const yellowCardHoldersAll: IStatHolder[] = [];
    const yellowCardHoldersH: IStatHolder[] = this.parseFormArrayList(this.yellowCardHoldersHome.value, 'home');
    const yellowCardHoldersA: IStatHolder[] = this.parseFormArrayList(this.yellowCardHoldersAway.value, 'away');
    yellowCardHoldersAll.push(...yellowCardHoldersH, ...yellowCardHoldersA);

    // GoalScorers
    const goalsHome: number = this.homeScore.value || 0;
    const goalsAway: number = this.awayScore.value || 0;
    const goalsAll: number = goalsHome + goalsAway;
    const penaltiesHome: number = this.homePenScore.value || 0;
    const penaltiesAway: number = this.awayPenScore.value || 0;
    const goalScorersAll: IStatHolder[] = [];
    const goalScorersH: IStatHolder[] = this.parseFormArrayList(this.scorersHome.value, 'home');
    const goalScorersA: IStatHolder[] = this.parseFormArrayList(this.scorersAway.value, 'away');
    goalScorersAll.push(...goalScorersH, ...goalScorersA);

    // Tournament type
    const fcpPlayed: number = this.fixture.type === 'FCP' ? 1 : 0;
    const fkcPlayed: number = this.fixture.type === 'FKC' ? 1 : 0;
    const fplPlayed: number = this.fixture.type === 'FPL' ? 1 : 0;

    // Players & Winners
    let homeWin: number = 0;
    let awayWin: number = 0;
    if (goalsHome !== goalsAway) {
      homeWin = (goalsHome > goalsAway) ? 1 : 0;
      awayWin = 1 - homeWin;
    } else if (this.penalties?.value === 1 && fplPlayed === 0) {
      homeWin = (penaltiesHome > penaltiesAway) ? 1 : 0;
      awayWin = 1 - homeWin;
    }
    const playersHome: IStatHolder[] = this.parseFormArrayList(this.homeTeamPlayersList, 'home');
    const playersAway: IStatHolder[] = this.parseFormArrayList(this.awayTeamPlayersList, 'away');
    const playersAll: IStatHolder[] = playersHome.concat(playersAway);
    let playerWinners: IStatHolder[] = homeWin ? playersHome : playersAway;
    if (homeWin === awayWin && homeWin === 0) {
      playerWinners = [];
    }

    // Preparing table data
    const cols: IStatHolderEntity = new IStatHolderEntity();
    const dataSource: IStatHolderEntityGeneric = new IStatHolderEntityGeneric();

    cols.season.push({ value: 'point', viewValue: 'Data Points' });
    cols.season.push({ value: 'update', viewValue: 'Season Stats Update' });
    cols.team.push({ value: 'point', viewValue: 'Data Points' });
    cols.team.push({ value: 'home', viewValue: 'Team Stats Update (Home)' });
    cols.team.push({ value: 'away', viewValue: 'Team Stats Update (Away)' });
    cols.player.push({ value: 'pointTwo', viewValue: 'Data Points' });
    cols.player.push({ value: 'applied', viewValue: 'Applied to' });
    cols.player.push({ value: 'updateTwo', viewValue: 'Player Stats Update' });

    dataSource.season.push({ point: STATISTICS.TOTAL_GOALS, update: this.parseNumericValue(goalsAll) });
    dataSource.season.push({ point: STATISTICS.FCP_PLAYED, update: this.parseNumericValue(fcpPlayed) });
    dataSource.season.push({ point: STATISTICS.FKC_PLAYED, update: this.parseNumericValue(fkcPlayed) });
    dataSource.season.push({ point: STATISTICS.FPL_PLAYED, update: this.parseNumericValue(fplPlayed) });
    dataSource.season.push({ point: STATISTICS.TOTAL_RED_CARDS, update: this.parseNumericValue(redCardHoldersAll.length) });
    dataSource.season.push({ point: STATISTICS.TOTAL_YELLOW_CARDS, update: this.parseNumericValue(yellowCardHoldersAll.length) });
    // dataSource.season.push({ point: STATISTICS.HIGHEST_GOALSCORER, update: '' });
    dataSource.team.push({ point: STATISTICS.FCP_PLAYED, home: this.parseNumericValue(fcpPlayed), away: this.parseNumericValue(fcpPlayed) });
    dataSource.team.push({ point: STATISTICS.FKC_PLAYED, home: this.parseNumericValue(fkcPlayed), away: this.parseNumericValue(fkcPlayed) });
    dataSource.team.push({ point: STATISTICS.FPL_PLAYED, home: this.parseNumericValue(fplPlayed), away: this.parseNumericValue(fplPlayed) });
    dataSource.team.push({ point: STATISTICS.GOALS, home: this.parseNumericValue(goalsHome), away: this.parseNumericValue(goalsAway) });
    dataSource.team.push({ point: STATISTICS.WINS, home: this.parseNumericValue(homeWin), away: this.parseNumericValue(awayWin) });
    dataSource.team.push({ point: STATISTICS.LOSSES, home: this.parseNumericValue(awayWin), away: this.parseNumericValue(homeWin) });
    dataSource.team.push({ point: STATISTICS.RED_CARDS, home: this.parseNumericValue(redCardHoldersH.length), away: this.parseNumericValue(redCardHoldersA.length) });
    dataSource.team.push({ point: STATISTICS.YELLOW_CARDS, home: this.parseNumericValue(yellowCardHoldersH.length), away: this.parseNumericValue(yellowCardHoldersA.length) });
    dataSource.team.push({ point: STATISTICS.GOALS_CONCEDED, home: this.parseNumericValue(goalsAway), away: this.parseNumericValue(goalsHome) });
    dataSource.player.push({ pointTwo: STATISTICS.APPEARANCES, applied: this.getFormArrayStringList(playersAll), updateTwo: this.parseNumericValue(playersAll.length ? 1 : 0) });
    dataSource.player.push({ pointTwo: STATISTICS.GOALS, applied: this.getFormArrayStringList(goalScorersAll), updateTwo: this.parseNumericValue(goalScorersAll.length ? 1 : 0) });
    dataSource.player.push({ pointTwo: STATISTICS.WINS, applied: this.getFormArrayStringList(playerWinners), updateTwo: this.parseNumericValue(playerWinners.length ? 1 : 0) });
    dataSource.player.push({ pointTwo: STATISTICS.RED_CARDS, applied: this.getFormArrayStringList(redCardHoldersAll), updateTwo: this.parseNumericValue(redCardHoldersAll.length ? 1 : 0) });
    dataSource.player.push({ pointTwo: STATISTICS.YELLOW_CARDS, applied: this.getFormArrayStringList(yellowCardHoldersAll), updateTwo: this.parseNumericValue(yellowCardHoldersAll.length ? 1 : 0) });

    this.reportSummary = new ReportSummary();
    for (const property in cols) {
      // property can be season, team & player
      this.reportSummary[property] = {
        cols: cols[property],
        dataSource: dataSource[property],
        displayCols: cols[property]?.map((el: ListOption) => el.value)
      }
    }
  }

  parseNumericValue(value: number): string {
    if (value && value > 0) {
      return `+${value}`;
    }
    return MatchConstants.LABEL_NOT_AVAILABLE;
  }

  parseFormArrayList(value: ListOption[], team: HOME_AWAY): IStatHolder[] {
    if (value && value.length) {
      return value.map((el: ListOption) => ({ team, value: el.viewValue } as IStatHolder));
    }
    return [];
  }

  getFormArrayStringList(value: IStatHolder[]): string {
    if (value && value.length) {
      return value.map((el: IStatHolder) => el.value).join(MatchConstants.JOINING_CHARACTER);
    }
    return MatchConstants.LABEL_NOT_AVAILABLE;
  }

  get scorersGoalsHome(): FormArray {
    return this.matchReportForm.get('scorersGoalsHome') as FormArray;
  }

  get scorersGoalsAway(): FormArray {
    return this.matchReportForm.get('scorersGoalsAway') as FormArray;
  }

  get scorersHome(): FormArray {
    return this.matchReportForm.get('scorersHome') as FormArray;
  }

  get scorersAway(): FormArray {
    return this.matchReportForm.get('scorersAway') as FormArray;
  }

  get totalGoals(): number {
    if (this.homeScore?.value >= 0 && this.awayScore?.value >= 0) {
      return this.homeScore?.value + this.awayScore?.value;
    }
    return 0;
  }

  get homeScore(): AbstractControl {
    return this.matchReportForm.get('homeScore');
  }

  get awayScore(): AbstractControl {
    return this.matchReportForm.get('awayScore');
  }

  get homePenScore(): AbstractControl {
    return this.matchReportForm?.get('homePenScore');
  }

  get awayPenScore(): AbstractControl {
    return this.matchReportForm?.get('awayPenScore');
  }

  get penalties(): AbstractControl {
    return this.matchReportForm?.get('penalties');
  }

  get referee(): AbstractControl {
    return this.matchReportForm?.get('referee');
  }

  get billsFile(): AbstractControl {
    return this.matchReportForm?.get('billsFile');
  }

  get matchReportFile(): AbstractControl {
    return this.matchReportForm?.get('matchReportFile');
  }

  get chipSelectionListHome() {
    return this.chipSelectionInputComponentHome && this.chipSelectionInputComponentHome.list ? this.chipSelectionInputComponentHome.list : []
  }

  get chipSelectionListAway() {
    return this.chipSelectionInputComponentAway && this.chipSelectionInputComponentAway.list ? this.chipSelectionInputComponentAway.list : []
  }

  get redCardHoldersAway(): FormArray {
    return this.matchReportForm?.get('redCardHoldersAway') as FormArray;
  }

  get yellowCardHoldersAway(): FormArray {
    return this.matchReportForm?.get('yellowCardHoldersAway') as FormArray;
  }

  get redCardHoldersHome(): FormArray {
    return this.matchReportForm?.get('redCardHoldersHome') as FormArray;
  }

  get yellowCardHoldersHome(): FormArray {
    return this.matchReportForm?.get('yellowCardHoldersHome') as FormArray;
  }

  get matchDayPlayersList(): ListOption[] {
    if (this.homeTeamPlayersList && this.awayTeamPlayersList) {
      return this.homeTeamPlayersList.concat(this.awayTeamPlayersList);
    }
    return [];
  }

  get isSubmitDisabled(): boolean {
    if (!this.matchReportForm.dirty) {
      return true;
    } else if (this.matchReportForm.invalid) {
      return true;
    } else if (this.penalties?.value === 1 && this.awayPenScore?.value === this.homePenScore?.value) {
      return true;
    }
    return false;
  }
}

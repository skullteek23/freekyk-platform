import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { CloudFunctionStatsData, MatchFixture, ReportSummary } from '@shared/interfaces/match.model';
import { ListOption } from '@shared/interfaces/others.model';
import { TeamMembers } from '@shared/interfaces/team.model';
import { MatchConstants, STATISTICS } from '@shared/constants/constants';
import { formsMessages, matchReportMessages } from '@shared/constants/messages';
import { ChipSelectionInputComponent } from './components/chip-selection-input/chip-selection-input.component';
import { SeasonAdminService } from '../../../services/season-admin.service';

export type HomeAway = 'home' | 'away';
export enum TeamSides {
  home = 'home',
  away = 'away'
}
export interface IStatHolder {
  team: HomeAway;
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
  styleUrls: ['./update-match-report.component.scss']
})
export class UpdateMatchReportComponent implements OnInit {

  @ViewChild('scorerSelectionHome') chipSelectionInputComponentHome: ChipSelectionInputComponent;
  @ViewChild('scorerSelectionAway') chipSelectionInputComponentAway: ChipSelectionInputComponent;

  readonly messages = matchReportMessages;
  readonly home = TeamSides.home;
  readonly away = TeamSides.away;

  awayTeam = '';
  awayTeamPlayersList: ListOption[] = [];
  fixture: MatchFixture;
  formMessages = formsMessages;
  homeTeam = '';
  homeTeamPlayersList: ListOption[] = [];
  isLoaderShown = false;
  isShowSummary = false;
  matchReportForm: FormGroup;
  reportSummary: ReportSummary;
  scorersList: ListOption[] = [];
  updateStats: CloudFunctionStatsData;

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
      homeScore: new FormControl(0, [Validators.required, Validators.pattern(RegexPatterns.num)]),
      awayScore: new FormControl(0, [Validators.required, Validators.pattern(RegexPatterns.num)]),
      penalties: new FormControl(0),
      homePenScore: new FormControl(null, [
        Validators.pattern(RegexPatterns.num), Validators.min(1), this.isHomeEqualScoreValidator.bind(this)
      ]),
      awayPenScore: new FormControl(null, [
        Validators.pattern(RegexPatterns.num), Validators.min(1), this.isAwayEqualScoreValidator.bind(this)
      ]),
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
      moneySpent: new FormControl(0, [Validators.required, Validators.pattern(RegexPatterns.num)]),
      referee: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaWithSpace)]),
      specialNotes: new FormControl(null, [Validators.pattern(RegexPatterns.bio), Validators.maxLength(200)]),
    });
  }

  getMatchInfo(): void {
    this.isLoaderShown = true;
    this.ngFire.collection('allMatches').doc(this.data).get().pipe(map(resp => resp.data() as MatchFixture)).subscribe(data => {
      if (data && data.date < new Date().getTime() && data.concluded === false) {
        this.fixture = data;
        this.homeTeam = this.fixture?.home?.name;
        this.awayTeam = this.fixture?.away?.name;
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
    });
  }

  isAwayEqualScoreValidator(control: AbstractControl): ValidationErrors {
    if (control.value === this.homePenScore?.value && this.penalties?.value === 1) {
      return { notEqual: true };
    }
    if (this.homePenScore?.value > 0) {
      this.homePenScore?.markAsUntouched();
    }
    return null;
  }

  isHomeEqualScoreValidator(control: AbstractControl): ValidationErrors {
    if (control.value === this.awayPenScore?.value && this.penalties?.value === 1) {
      return { notEqual: true };
    }
    if (this.awayPenScore?.value > 0) {
      this.awayPenScore?.markAsUntouched();
    }
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
      for (const element of homeMembers) {
        this.homeTeamPlayersList.push({
          viewValue: element.name,
          value: element.id
        });
      }
    }
    if (awayMembers && awayMembers.length) {
      for (const element of awayMembers) {
        this.awayTeamPlayersList.push({
          viewValue: element.name,
          value: element.id
        });
      }
    }
    this.isLoaderShown = false;
  }

  getTeamInfo(name: string): Observable<any> {
    if (name) {
      return this.ngFire.collection('teams', query => query.where('tname', '==', name)).get()
        .pipe(map(resp => resp?.docs[0]?.id));
    }
  }

  getMemberInfo(teamID: string): Observable<any> {
    if (teamID) {
      return this.ngFire.collection(`teams/${teamID}/additionalInfo`).doc('members').get()
        .pipe(map(resp => (resp?.data() as TeamMembers)?.members));
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

  onAddScorer(newOption: ListOption, team: HomeAway): void {
    const control = new FormControl(newOption);
    const controlGoal = new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.num), Validators.min(1)]);
    if (team === TeamSides.home) {
      this.scorersHome.push(control);
      this.scorersGoalsHome.push(controlGoal);
    } else {
      this.scorersAway.push(control);
      this.scorersGoalsAway.push(controlGoal);
    }
  }

  onRemoveScorerGoal(team: HomeAway): void {
    if (team === TeamSides.home) {
      const removeIndex = this.scorersGoalsHome.length > 0 ? this.scorersGoalsHome.length - 1 : 0;
      this.scorersHome.removeAt(removeIndex);
      this.scorersGoalsHome.removeAt(removeIndex);
    } else {
      const removeIndex = this.scorersGoalsAway.length > 0 ? this.scorersGoalsAway.length - 1 : 0;
      this.scorersAway.removeAt(removeIndex);
      this.scorersGoalsAway.removeAt(removeIndex);
    }
  }

  onAddCard(newOption: ListOption, controlName: string): void {
    const control = new FormControl(newOption);
    (this.matchReportForm.get(controlName) as FormArray).push(control);
  }

  onRemoveCard(controlName: string): void {
    const formArray = this.matchReportForm.get(controlName) as FormArray;
    const length = formArray.length;
    const removeIndex = length - 1;
    formArray.removeAt(removeIndex);
  }

  onGenerateSummary() {
    if (this.isSubmitDisabled()) {
      this.snackbarService.displayError('Please try again!');
      this.matchReportForm.markAllAsTouched();
      return;
    }
    this.isShowSummary = true;
    const summaryElement = document.getElementById('match-summary');
    summaryElement.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    this.assignSummary();
  }

  onSubmitMatchReport() {
    // on submit details
    if (!this.isSubmitDisabled()) {
      this.isLoaderShown = true;
      const fixture: MatchFixture = {
        ...this.fixture,
        id: this.data
      };
      const options = {
        formData: this.matchReportForm.value,
        fixture,
        playersListHome: this.homeTeamPlayersList,
        playersListAway: this.awayTeamPlayersList
      };
      this.seasonAdminService.updateMatchReport(options)
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
    const redCardHoldersH: IStatHolder[] = this.parseFormArrayList(this.redCardHoldersHome.value, TeamSides.home);
    const redCardHoldersA: IStatHolder[] = this.parseFormArrayList(this.redCardHoldersAway.value, TeamSides.away);
    redCardHoldersAll.push(...redCardHoldersH, ...redCardHoldersA);

    // Yellow Card Holders
    const yellowCardHoldersAll: IStatHolder[] = [];
    const yellowCardHoldersH: IStatHolder[] = this.parseFormArrayList(this.yellowCardHoldersHome.value, TeamSides.home);
    const yellowCardHoldersA: IStatHolder[] = this.parseFormArrayList(this.yellowCardHoldersAway.value, TeamSides.away);
    yellowCardHoldersAll.push(...yellowCardHoldersH, ...yellowCardHoldersA);

    // GoalScorers
    const goalsHome: number = this.homeScore.value || 0;
    const goalsAway: number = this.awayScore.value || 0;
    const goalsAll: number = goalsHome + goalsAway;
    const penaltiesHome: number = this.homePenScore.value || 0;
    const penaltiesAway: number = this.awayPenScore.value || 0;
    const goalScorersAll: IStatHolder[] = [];
    const goalScorersH: IStatHolder[] = this.parseScorersArrayList(this.scorersHome.value, this.scorersGoalsHome.value, TeamSides.home);
    const goalScorersA: IStatHolder[] = this.parseScorersArrayList(this.scorersAway.value, this.scorersGoalsAway.value, TeamSides.away);
    goalScorersAll.push(...goalScorersH, ...goalScorersA);

    // Tournament type
    const fcpPlayed: number = this.fixture.type === 'FCP' ? 1 : 0;
    const fkcPlayed: number = this.fixture.type === 'FKC' ? 1 : 0;
    const fplPlayed: number = this.fixture.type === 'FPL' ? 1 : 0;

    // Players & Winners
    let homeWin = 0;
    let awayWin = 0;
    if (goalsHome !== goalsAway) {
      homeWin = (goalsHome > goalsAway) ? 1 : 0;
      awayWin = 1 - homeWin;
    } else if (this.penalties?.value === 1 && fplPlayed === 0) {
      homeWin = (penaltiesHome > penaltiesAway) ? 1 : 0;
      awayWin = 1 - homeWin;
    }
    const playersHome: IStatHolder[] = this.parseFormArrayList(this.homeTeamPlayersList, TeamSides.home);
    const playersAway: IStatHolder[] = this.parseFormArrayList(this.awayTeamPlayersList, TeamSides.away);
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
    cols.team.push({ value: TeamSides.home, viewValue: `${this.fixture.home.name}'s Update` });
    cols.team.push({ value: TeamSides.away, viewValue: `${this.fixture.away.name}'s Update` });
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
    dataSource.team.push({
      point: STATISTICS.FCP_PLAYED, home: this.parseNumericValue(fcpPlayed), away: this.parseNumericValue(fcpPlayed)
    });
    dataSource.team.push({
      point: STATISTICS.FKC_PLAYED, home: this.parseNumericValue(fkcPlayed), away: this.parseNumericValue(fkcPlayed)
    });
    dataSource.team.push({
      point: STATISTICS.FPL_PLAYED, home: this.parseNumericValue(fplPlayed), away: this.parseNumericValue(fplPlayed)
    });
    dataSource.team.push({ point: STATISTICS.GOALS, home: this.parseNumericValue(goalsHome), away: this.parseNumericValue(goalsAway) });
    dataSource.team.push({ point: STATISTICS.WINS, home: this.parseNumericValue(homeWin), away: this.parseNumericValue(awayWin) });
    dataSource.team.push({ point: STATISTICS.LOSSES, home: this.parseNumericValue(awayWin), away: this.parseNumericValue(homeWin) });
    dataSource.team.push({
      point: STATISTICS.RED_CARDS,
      home: this.parseNumericValue(redCardHoldersH.length),
      away: this.parseNumericValue(redCardHoldersA.length)
    });
    dataSource.team.push({
      point: STATISTICS.YELLOW_CARDS,
      home: this.parseNumericValue(yellowCardHoldersH.length),
      away: this.parseNumericValue(yellowCardHoldersA.length)
    });
    dataSource.team.push({
      point: STATISTICS.GOALS_CONCEDED,
      home: this.parseNumericValue(goalsAway),
      away: this.parseNumericValue(goalsHome)
    });
    dataSource.player.push({
      pointTwo: STATISTICS.APPEARANCES,
      applied: this.getFormArrayStringList(playersAll),
      updateTwo: this.parseNumericValue(playersAll.length ? 1 : 0)
    });
    dataSource.player.push({
      pointTwo: STATISTICS.GOALS,
      applied: this.getFormArrayStringList(goalScorersAll),
      updateTwo: '-'
    });
    dataSource.player.push({
      pointTwo: STATISTICS.WINS,
      applied: this.getFormArrayStringList(playerWinners),
      updateTwo: this.parseNumericValue(playerWinners.length ? 1 : 0)
    });
    dataSource.player.push({
      pointTwo: STATISTICS.RED_CARDS,
      applied: this.getFormArrayStringList(redCardHoldersAll),
      updateTwo: this.parseNumericValue(redCardHoldersAll.length ? 1 : 0)
    });
    dataSource.player.push({
      pointTwo: STATISTICS.YELLOW_CARDS,
      applied: this.getFormArrayStringList(yellowCardHoldersAll),
      updateTwo: this.parseNumericValue(yellowCardHoldersAll.length ? 1 : 0)
    });

    this.reportSummary = new ReportSummary();
    for (const property in cols) {
      // property can be season, team & player
      if (cols.hasOwnProperty(property) && cols[property]) {
        this.reportSummary[property] = {
          cols: cols[property],
          dataSource: dataSource[property],
          displayCols: cols[property]?.map((el: ListOption) => el.value)
        };
      }
    }
  }

  parseNumericValue(value: number): string {
    if (value && value > 0) {
      return `+${value}`;
    }
    return MatchConstants.LABEL_NOT_AVAILABLE;
  }

  parseFormArrayList(value: ListOption[], team: HomeAway): IStatHolder[] {
    if (value && value.length) {
      return value.map((el: ListOption) => ({ team, value: el.viewValue } as IStatHolder));
    }
    return [];
  }

  parseScorersArrayList(scorers: ListOption[], goals: number[], team: HomeAway): IStatHolder[] {
    if (goals?.length && scorers?.length && scorers.length === goals.length) {
      const result: IStatHolder[] = [];
      for (let i = 0; i < scorers.length; i++) {
        const scorer: ListOption = scorers[i];
        const goalScored: number = goals[i];
        if (scorer && goalScored > 0) {
          result.push({ value: `${scorer.viewValue} (${goalScored})`, team });
        }
      }
      return result;
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

  get homeScore(): AbstractControl {
    return this.matchReportForm?.get('homeScore');
  }

  get awayScore(): AbstractControl {
    return this.matchReportForm?.get('awayScore');
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
    return this.chipSelectionInputComponentHome && this.chipSelectionInputComponentHome.list
      ? this.chipSelectionInputComponentHome.list
      : [];
  }

  get chipSelectionListAway() {
    return this.chipSelectionInputComponentAway && this.chipSelectionInputComponentAway.list
      ? this.chipSelectionInputComponentAway.list
      : [];
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

  isSubmitDisabled(): boolean {
    return (!this.matchReportForm.dirty
      || this.matchReportForm.invalid
      || (this.penalties?.value === 1 && (this.awayPenScore?.value === this.homePenScore?.value))
      || this.totalInputGoalsAway > this.awayScore?.value
      || this.totalInputGoalsHome > this.homeScore?.value
    );
  }

  get totalInputGoalsHome(): number {
    return this.scorersGoalsHome?.value?.length ? (this.scorersGoalsHome.value as number[]).reduce((a, b) => a + b) : 0;
  }

  get totalInputGoalsAway(): number {
    return this.scorersGoalsAway?.value?.length ? (this.scorersGoalsAway.value as number[]).reduce((a, b) => a + b) : 0;
  }
}

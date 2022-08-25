import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Observable, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  MatchFixture,
  MatchStats,
} from 'src/app/shared/interfaces/match.model';
import { MatRadioChange } from '@angular/material/radio';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { AngularFireFunctions } from '@angular/fire/functions';
import { CLOUD_FUNCTIONS } from 'src/app/shared/Constants/CLOUD_FUNCTIONS';
import { SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-update-mr',
  templateUrl: './update-mr.component.html',
  styleUrls: ['./update-mr.component.css'],
})
export class UpdateMrComponent implements OnInit, OnDestroy {
  matchReport: FormGroup;
  matches$: Observable<MatchFixture[]>;
  selectedSeason: string;
  selectedMatch: MatchFixture;

  seasonName = '';
  subscriptions = new Subscription();
  matches: MatchFixture[] = [];
  isLoading = false;
  matchReportForm = new FormGroup({});

  constructor(
    private ngFire: AngularFirestore,
    private ngFunc: AngularFireFunctions,
    private snackServ: SnackbarService,
    private route: ActivatedRoute
  ) {
    const qParams = this.route.snapshot.queryParams;
    if (qParams && qParams.hasOwnProperty('name')) {
      this.isLoading = true;
      this.seasonName = qParams.name;
      this.getMatches();
    }
  }

  ngOnInit(): void {
    this.matchReportForm = new FormGroup({
      id: new FormControl(null, Validators.required),
      home: new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]\d*$/),]),
      away: new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]\d*$/),]),
      pen: new FormControl(false, Validators.required),
      endDate: new FormControl(null, Validators.required, this.PastDateChecker.bind(this)),
      penHomeScore: new FormControl({ value: null, disabled: true }, [Validators.pattern(/^[0-9]\d*$/),]),
      penAwayScore: new FormControl({ value: null, disabled: true }, [Validators.pattern(/^[0-9]\d*$/),]),
      scorerHome: new FormArray([]),
      scorerAway: new FormArray([]),
    });
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  getMatches(): void {
    this.subscriptions.add(
      this.ngFire.collection('allMatches', query => query.where('season', '==', this.seasonName).where('concluded', '==', false)).get()
        .subscribe(response => {
          if (response.docs.length) {
            this.matches = response.docs.map(doc => { return { id: doc.id, ...doc.data() as MatchFixture } });
            this.isLoading = false;
          }
        })
    )
  }
  onSetPenalties(event: MatRadioChange) {
    event.value
      ? this.matchReport.get('pen_resultHome').enable()
      : this.matchReport.get('pen_resultHome').disable();
    event.value
      ? this.matchReport.get('pen_resultAway').enable()
      : this.matchReport.get('pen_resultAway').disable();
  }
  onSubmit() {
    // console.log(this.matchReport.value);
    const mid = this.matchReport.value['mid'];
    const sname = this.selectedSeason || null;
    const tie_breaker = this.matchReport.value['penalties'] == true;
    let allPromises = [];
    allPromises.push(
      this.ngFire
        .collection('allMatches/' + mid + '/additionalInfo')
        .doc('matchReport')
        .set(<MatchStats>{
          ...this.matchReport.value,
          sname,
          matchEndDate: new Date(this.matchReport.value['matchEndDate']),
        })
    );
    allPromises.push(
      this.ngFire
        .collection('allMatches')
        .doc(mid)
        .update({
          score: [
            this.matchReport.value['homeScore'],
            this.matchReport.value['awayScore'],
          ],
          tie_breaker: tie_breaker,
          concluded: true,
        })
    );
    if (this.selectedMatch.type === 'FPL') {
      const data = {
        mid: this.selectedMatch.id,
        sid: this.selectedSeason,
        homeTeam: this.selectedMatch.home.name,
        awayTeam: this.selectedMatch.away.name,
        score: this.selectedMatch.home.score,
      };
      const callable = this.ngFunc.httpsCallable(
        CLOUD_FUNCTIONS.UPDATE_LEAGUE_TABLE
      );
      allPromises.push(callable(data));
    }

    Promise.all(allPromises).then(() => {
      this.snackServ.displayCustomMsg('Match updated successfully!');
      this.matchReport.reset();
    });
  }
  onSelectMatch(match: MatSelectChange) {
    this.selectedMatch = match.value;
    this.matchReport.patchValue({ mid: match.value });
  }
  onAddControl(side: 'home' | 'away') {
    const fmCtrl = new FormControl(null, [
      Validators.required,
      Validators.pattern('^[A-Za-z ]+$'),
    ]);
    if (side == 'home')
      (<FormArray>this.matchReport.get('scorersHome')).push(fmCtrl);
    else if (side == 'away')
      (<FormArray>this.matchReport.get('scorersAway')).push(fmCtrl);
    else return;
  }
  onRemoveControl(side: 'home' | 'away', removeIndex: number) {
    if (side == 'home')
      (<FormArray>this.matchReport.get('scorersHome')).removeAt(removeIndex);
    else if (side == 'away')
      (<FormArray>this.matchReport.get('scorersAway')).removeAt(removeIndex);
    else return;
  }
  getFormArray(side: 'home' | 'away') {
    if (side == 'home')
      return (<FormArray>this.matchReport.get('scorersHome')).controls;
    else if (side == 'away')
      return (<FormArray>this.matchReport.get('scorersAway')).controls;
    else return [];
  }
  PastDateChecker(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    let DateToBeChecked: number = new Date().getTime();
    return new Date(control.value).getTime() > DateToBeChecked
      ? of({ invalidDate: true })
      : of(null);
  }
}

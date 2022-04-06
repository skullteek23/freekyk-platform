import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  MatchFixture,
  MatchStats,
} from 'src/app/shared/interfaces/match.model';
import { MatRadioChange } from '@angular/material/radio';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { SeasonBasicInfo } from '../../shared/interfaces/season.model';

@Component({
  selector: 'app-update-mr',
  templateUrl: './update-mr.component.html',
  styleUrls: ['./update-mr.component.css'],
})
export class UpdateMrComponent implements OnInit {
  matchReport: FormGroup;
  existingSeasons$: Observable<SeasonBasicInfo[]>;
  matches$: Observable<MatchFixture[]>;
  constructor(
    private ngFire: AngularFirestore,
    private snackServ: SnackbarService
  ) {
    this.getSeasons();
  }

  ngOnInit(): void {
    this.matchReport = new FormGroup({
      mid: new FormControl(null, Validators.required),
      homeScore: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[0-9]\d*$/),
      ]),
      awayScore: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[0-9]\d*$/),
      ]),
      penalties: new FormControl(false, Validators.required),
      matchEndDate: new FormControl(
        null,
        Validators.required,
        this.PastDateChecker.bind(this)
      ),
      pen_resultHome: new FormControl({ value: null, disabled: true }, [
        Validators.pattern(/^[0-9]\d*$/),
      ]),
      pen_resultAway: new FormControl({ value: null, disabled: true }, [
        Validators.pattern(/^[0-9]\d*$/),
      ]),
      scorersHome: new FormArray([]),
      scorersAway: new FormArray([]),
    });
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
    console.log(this.matchReport.value);
    const mid = this.matchReport.value['mid'];
    const tie_breaker = this.matchReport.value['penalties'] == true;
    let allPromises = [];
    allPromises.push(
      this.ngFire
        .collection('allMatches/' + mid + '/additionalInfo')
        .doc('matchReport')
        .set(<MatchStats>{
          ...this.matchReport.value,
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

    Promise.all(allPromises).then(() => {
      this.snackServ.displayCustomMsg('Match updated successfully!');
      this.matchReport.reset();
    });
  }
  getSeasons() {
    this.existingSeasons$ = this.ngFire
      .collection('seasons')
      .get()
      .pipe(
        map((resp) =>
          resp.docs.map(
            (doc) =>
              <SeasonBasicInfo>{ id: doc.id, ...(<SeasonBasicInfo>doc.data()) }
          )
        )
      );
  }
  getMatches(season: MatSelectChange) {
    this.matches$ = this.ngFire
      .collection('allMatches', (query) =>
        query
          .where('season', '==', season.value)
          .where('concluded', '==', false)
      )
      .get()
      .pipe(
        map((resp) =>
          resp.docs.map(
            (doc) => <MatchFixture>{ id: doc.id, ...(<MatchFixture>doc.data()) }
          )
        )
      );
  }
  onSelectMatch(match: MatSelectChange) {
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

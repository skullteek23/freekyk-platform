import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSelectionList } from '@angular/material/list';
import { Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GroundPrivateInfo } from 'src/app/shared/interfaces/ground.model';
import { GenFixtService } from '../gen-fixt.service';

@Component({
  selector: 'app-gf-sel-ground',
  templateUrl: './gf-sel-ground.component.html',
  styleUrls: ['./gf-sel-ground.component.css'],
})
export class GfSelGroundComponent implements OnInit, OnDestroy {
  grInfo$: Observable<GroundPrivateInfo[]>;
  totGrounds: number = 0;
  minVal: number = 0;
  reqHrs: number = 0;
  sState: string = 'unknown';
  sCity: string = 'unknown';
  noGrounds: boolean = false;
  sub: Subscription;

  constructor(
    private ngFire: AngularFirestore,
    private genServ: GenFixtService,
    private snackServ: SnackbarService
  ) {}
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  ngOnInit(): void {
    const data = this.genServ.getTourData();
    const sData = this.genServ.getSeason();
    this.sub = this.genServ.hrsChanged.subscribe((hrs) => (this.reqHrs = hrs));
    this.getGrounds(sData.locState, sData.locCity);
  }
  getGrounds(state: string, city: string) {
    this.sState = this.genServ.getSeason().locState;
    this.sCity = this.genServ.getSeason().locCity;
    this.grInfo$ = this.ngFire
      .collection('groundsTimings', (query) =>
        query.where('locState', '==', state).where('locCity', '==', city)
      )
      .get()
      .pipe(
        tap((resp) => (this.noGrounds = resp.empty)),
        tap((resp) => (this.totGrounds = resp.size)),
        map((resp) => resp.docs.map((doc) => <GroundPrivateInfo>doc.data()))
      );
  }
  getAvDays(timings: {}) {
    const availDays: string[] = [];
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    for (let i = 0; i < days.length; i++)
      if (timings.hasOwnProperty(i)) availDays.push(days[i]);
    return availDays.join(', ');
  }
  onNext(event: any[]) {
    this.genServ.addTimings(event.map((sel) => sel.value));
    this.genServ.onNextStep();
  }
  onPrevious() {
    this.genServ.onPreviousStep();
  }
  CalcMinDur(event: MatSelectionList) {
    if (!event.selectedOptions.isEmpty())
      this.minVal = this.genServ.onCalcMinDur(
        event.selectedOptions.selected.map((sel) => sel.value.timings)
      );
    else
      this.snackServ.displayCustomMsg('Select 1 or more grounds to calculate');
  }
}

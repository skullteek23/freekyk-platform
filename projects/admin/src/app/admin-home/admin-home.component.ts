import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css'],
})
export class AdminHomeComponent implements OnInit {
  activeSeasons$: Observable<number>;
  totPlayers$: Observable<number>;
  totGrounds$: Observable<number>;
  unresTickets$: Observable<number>;
  totTeams$: Observable<number>;
  totFs$: Observable<number>;
  totProds$: Observable<number>;
  totAcads$: Observable<number>;
  activeContests$: Observable<number>;
  constructor(private adminNgFire: AngularFirestore) {
    this.getValues();
  }

  ngOnInit(): void {}
  getValues() {
    this.activeSeasons$ = this.adminNgFire
      .collection('seasons')
      .get()
      .pipe(map((resp) => (resp.size == null ? 0 : resp.size)));
    this.totPlayers$ = this.adminNgFire
      .collection('players')
      .get()
      .pipe(map((resp) => (resp.size == null ? 0 : resp.size)));
    this.totGrounds$ = this.adminNgFire
      .collection('grounds')
      .get()
      .pipe(map((resp) => (resp.size == null ? 0 : resp.size)));
    this.unresTickets$ = this.adminNgFire
      .collection('tickets', (query) =>
        query.where('tkt_status', '!=', 'Complete')
      )
      .get()
      .pipe(map((resp) => (resp.size == null ? 0 : resp.size)));
    this.totTeams$ = this.adminNgFire
      .collection('teams')
      .get()
      .pipe(map((resp) => (resp.size == null ? 0 : resp.size)));
    this.totFs$ = this.adminNgFire
      .collection('freestylers')
      .get()
      .pipe(map((resp) => (resp.size == null ? 0 : resp.size)));
    this.totProds$ = this.adminNgFire
      .collection('products')
      .get()
      .pipe(map((resp) => (resp.size == null ? 0 : resp.size)));
    this.totAcads$ = this.adminNgFire
      .collection('academies')
      .get()
      .pipe(map((resp) => (resp.size == null ? 0 : resp.size)));
    this.activeContests$ = this.adminNgFire
      .collection('contests')
      .get()
      .pipe(map((resp) => (resp.size == null ? 0 : resp.size)));
  }
}

import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import { AppState } from 'src/app/store/app.reducer';
import firebase from 'firebase/app';
@Component({
  selector: 'app-da-ho-all-fixtures',
  templateUrl: './da-ho-all-fixtures.component.html',
  styleUrls: ['./da-ho-all-fixtures.component.css'],
})
export class DaHoAllFixturesComponent implements OnInit {
  isLoading = true;
  isLoadingFixtures = true;
  thisTime: firebase.firestore.Timestamp;
  noFixture: boolean;
  fixtures: MatchFixture[] = [];
  results: MatchFixture[] = [];
  noMyFixture: boolean;
  myFixtures: MatchFixture[] = [];
  fixtFilters = ['Premium', 'Tournament Type', 'Location', 'Season'];
  constructor(
    private ngfire: AngularFirestore,
    private store: Store<AppState>
  ) {
    this.thisTime = new firebase.firestore.Timestamp(
      new Date().getTime() / 1000,
      0
    );
    this.getPlayerFixtures();
  }
  onChangeIndex(changeState: MatTabChangeEvent) {
    this.isLoadingFixtures = true;
    this.noFixture = false;
    this.fixtures = [];
    switch (changeState.index) {
      case 0:
        this.getPlayerFixtures();
        break;
      case 1:
        this.getFixtures();
        break;
      case 2:
        this.getResults();
        break;
      default:
        break;
    }
  }
  async getFixtures() {
    let fixtSnap = await this.ngfire
      .collection('allMatches', (query) =>
        query.where('date', '>', this.thisTime).limit(6)
      )
      .get()
      .pipe(
        map((responseData) => {
          let newFixtures = [];
          responseData.forEach((element) => {
            let elementData = <MatchFixture>element.data();
            newFixtures.push({ id: element.id, ...elementData });
          });
          return newFixtures;
        })
      )
      .toPromise();
    if (fixtSnap.length == 0) {
      this.noFixture = true;
      console.log('empty');
    } else {
      this.fixtures = fixtSnap;
    }
    this.isLoading = false;
    this.isLoadingFixtures = false;
  }
  async getResults() {
    let fixtSnap = await this.ngfire
      .collection('allMatches', (query) =>
        query.where('date', '<', this.thisTime).limit(6)
      )
      .get()
      .pipe(
        map((responseData) => {
          let newFixtures = [];
          responseData.forEach((element) => {
            let elementData = <MatchFixture>element.data();
            newFixtures.push({ id: element.id, ...elementData });
          });
          console.log(newFixtures);
          return newFixtures;
        })
      )
      .toPromise();
    if (fixtSnap.length == 0) {
      this.noFixture = true;
    } else {
      this.results = fixtSnap;
    }
    this.isLoading = false;
    this.isLoadingFixtures = false;
  }
  getPlayerFixtures() {
    this.store
      .select('team')
      .pipe(map((data) => data.upcomingMatches))
      .subscribe((fx) => {
        this.myFixtures = fx.length == 0 ? [] : fx;
        this.noMyFixture = fx.length == 0;
        this.isLoading = false;
        this.isLoadingFixtures = false;
      });
  }

  ngOnInit(): void {}
}

import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';

@Component({
  selector: 'app-pl-fixtures',
  templateUrl: './pl-fixtures.component.html',
  styleUrls: ['./pl-fixtures.component.css'],
})
export class PlFixturesComponent implements OnInit {
  isLoading: boolean = true;
  noFixtures: boolean = false;
  Fixtures$: Observable<MatchFixture[]>;
  fixtFilters = ['Premium', 'Tournament Type', 'Location', 'Season', 'Team'];
  constructor(private ngFire: AngularFirestore) {}
  ngOnInit(): void {
    this.getFixtures();
  }
  getFixtures() {
    this.Fixtures$ = this.ngFire
      .collection('allMatches', (query) =>
        query.where('concluded', '==', false)
      )
      .get()
      .pipe(
        tap((val) => {
          this.noFixtures = val.empty;
          this.isLoading = false;
        }),
        map((resp) => <MatchFixture[]>resp.docs.map((doc) => doc.data()))
      );
  }
}

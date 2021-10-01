import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MatchFilters } from 'src/app/shared/Constants/FILTERS';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import { FilterData } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-pl-fixtures',
  templateUrl: './pl-fixtures.component.html',
  styleUrls: ['./pl-fixtures.component.css'],
})
export class PlFixturesComponent implements OnInit {
  isLoading: boolean = true;
  noFixtures: boolean = false;
  Fixtures$: Observable<MatchFixture[]>;
  filterData: FilterData;
  constructor(private ngFire: AngularFirestore) {}
  ngOnInit(): void {
    this.filterData = {
      defaultFilterPath: 'allMatches',
      filtersObj: MatchFilters,
    };
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

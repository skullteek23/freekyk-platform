import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { MatchFilters } from 'src/app/shared/Constants/FILTERS';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import { FilterData } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-pl-fixtures',
  templateUrl: './pl-fixtures.component.html',
  styleUrls: ['./pl-fixtures.component.css'],
})
export class PlFixturesComponent implements OnInit {
  isLoading = true;
  noFixtures = false;
  fixtures$: Observable<MatchFixture[]>;
  filterData: FilterData;
  constructor(
    private ngFire: AngularFirestore,
    private queryServ: QueryService
  ) {}
  ngOnInit(): void {
    this.filterData = {
      defaultFilterPath: 'allMatches',
      filtersObj: MatchFilters,
    };
    this.getFixtures();
  }
  getFixtures(): void {
    this.fixtures$ = this.ngFire
      .collection('allMatches', (query) =>
        query.where('concluded', '==', false)
      )
      .get()
      .pipe(
        tap((val) => {
          this.noFixtures = val.empty;
          this.isLoading = false;
        }),
        map((resp) => resp.docs.map((doc) => doc.data() as MatchFixture))
      );
  }
  onQueryData(queryInfo): void {
    if (queryInfo === null) {
      return this.getFixtures();
    }
    this.fixtures$ = this.queryServ
      .onQueryMatches(queryInfo, 'allMatches', true)
      .pipe(map((resp) => resp.docs.map((doc) => doc.data() as MatchFixture)));
  }
}

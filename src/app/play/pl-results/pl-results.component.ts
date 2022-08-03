import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { MatchFilters } from 'src/app/shared/Constants/FILTERS';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import { FilterData } from 'src/app/shared/interfaces/others.model';
import { ArraySorting } from 'src/app/shared/utils/array-sorting';

@Component({
  selector: 'app-pl-results',
  templateUrl: './pl-results.component.html',
  styleUrls: ['./pl-results.component.css'],
})
export class PlResultsComponent implements OnInit {
  isLoading = true;
  noResults = false;
  results$: Observable<MatchFixture[]>;
  filterData: FilterData;
  constructor(
    private ngFire: AngularFirestore,
    private queryServ: QueryService
  ) { }
  ngOnInit(): void {
    this.filterData = {
      defaultFilterPath: 'allMatches',
      filtersObj: MatchFilters,
    };
    this.getResults();
  }
  getResults(): void {
    this.results$ = this.ngFire
      .collection('allMatches', (query) => query.where('concluded', '==', true))
      .get()
      .pipe(
        tap((val) => {
          this.noResults = val.empty;
          this.isLoading = false;
          // console.log(val);
        }),
        map((resp) => resp.docs.map((doc) => doc.data() as MatchFixture)),
        map((resp) => resp.sort(ArraySorting.sortObjectByKey('date')))
      );
  }
  onQueryData(queryInfo): void {
    if (queryInfo === null) {
      return this.getResults();
    }
    this.results$ = this.queryServ
      .onQueryMatches(queryInfo, 'allMatches', true)
      .pipe(map((resp) => resp.docs.map((doc) => doc.data() as MatchFixture)));
  }
}

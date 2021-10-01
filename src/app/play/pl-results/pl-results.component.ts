import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MatchFilters } from 'src/app/shared/Constants/FILTERS';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import { FilterData } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-pl-results',
  templateUrl: './pl-results.component.html',
  styleUrls: ['./pl-results.component.css'],
})
export class PlResultsComponent implements OnInit {
  isLoading: boolean = true;
  noResults: boolean = false;
  results$: Observable<MatchFixture[]>;
  resultFilters = ['Premium', 'Tournament Type', 'Location', 'Season', 'Team'];
  filterData: FilterData;
  constructor(private ngFire: AngularFirestore) {}
  ngOnInit(): void {
    this.filterData = {
      defaultFilterPath: 'allMatches',
      filtersObj: MatchFilters,
    };
    this.getResults();
  }
  getResults() {
    this.results$ = this.ngFire
      .collection('allMatches', (query) => query.where('concluded', '==', true))
      .get()
      .pipe(
        tap((val) => {
          this.noResults = val.empty;
          this.isLoading = false;
        }),
        map((resp) =>
          resp.docs.map(
            (doc) => <MatchFixture>{ id: doc.id, ...(<MatchFixture>doc.data()) }
          )
        )
      );
  }
}

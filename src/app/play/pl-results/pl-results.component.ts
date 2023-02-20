import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatchFixture } from '@shared/interfaces/match.model';
import { ApiService } from '@shared/services/api.service';

@Component({
  selector: 'app-pl-results',
  templateUrl: './pl-results.component.html',
  styleUrls: ['./pl-results.component.scss'],
})
export class PlResultsComponent implements OnInit, OnDestroy {

  isLoaderShown = true;
  noResults = false;
  results$: Observable<MatchFixture[]>;
  subscriptions = new Subscription();

  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.getResults();
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  getResults(): void {
    this.isLoaderShown = true;
    this.results$ = this.apiService
      .getResults()
      .pipe(
        tap((val) => {
          this.noResults = val.length === 0;
          this.isLoaderShown = false;
        }),
      );
  }
}

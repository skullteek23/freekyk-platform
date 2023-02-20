import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatchFixture } from '@shared/interfaces/match.model';
import { FilterData } from '@shared/interfaces/others.model';
import { ApiService } from '@shared/services/api.service';

@Component({
  selector: 'app-pl-fixtures',
  templateUrl: './pl-fixtures.component.html',
  styleUrls: ['./pl-fixtures.component.scss'],
})
export class PlFixturesComponent implements OnInit, OnDestroy {

  @Input() season: string = '';

  isLoading = true;
  noFixtures = false;
  fixtures$: Observable<MatchFixture[]>;
  filterData: FilterData;
  subscriptions = new Subscription();

  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.getFixtures();
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  getFixtures(): void {
    this.isLoading = true;
    this.fixtures$ = this.apiService
      .getFixtures()
      .pipe(
        tap((val) => {
          this.noFixtures = val.length === 0;
          this.isLoading = false;
        }),
      );
  }
}

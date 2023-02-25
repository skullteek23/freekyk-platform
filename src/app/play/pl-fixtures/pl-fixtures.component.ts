import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatchFixture } from '@shared/interfaces/match.model';
import { ApiService } from '@shared/services/api.service';
import { MatTabGroup } from '@angular/material/tabs';
import { SnackbarService } from '@app/services/snackbar.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-pl-fixtures',
  templateUrl: './pl-fixtures.component.html',
  styleUrls: ['./pl-fixtures.component.scss'],
})
export class PlFixturesComponent implements AfterViewInit, OnDestroy {

  isLoaderShown = false;
  fixtures: MatchFixture[] = [];
  results: MatchFixture[] = [];
  subscriptions = new Subscription();
  selectedIndex;

  @ViewChild(MatTabGroup) matTabGroup: MatTabGroup;

  constructor(
    private apiService: ApiService,
    private snackbarService: SnackbarService,
    private router: Router
  ) { }

  ngAfterViewInit(): void {
    if (this.router.url.includes('results')) {
      this.selectedIndex = 1;
    } else {
      this.selectedIndex = 0;
    }
    this.onTabChange(this.selectedIndex);
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  getFixtures(): void {
    this.isLoaderShown = true;
    this.apiService.getFixtures()
      .subscribe({
        next: (response) => {
          this.fixtures = [];
          if (response) {
            this.fixtures = response;
          }
          this.isLoaderShown = false;
          window.scrollTo(0, 0);
        },
        error: (error) => {
          this.fixtures = [];
          this.snackbarService.displayError('Error getting fixtures, try again later!');
          this.isLoaderShown = false;
          window.scrollTo(0, 0);
        }
      })
  }

  getResults(): void {
    this.isLoaderShown = true;
    this.apiService.getResults()
      .subscribe({
        next: (response) => {
          this.results = [];
          if (response) {
            this.results = response;
          }
          this.isLoaderShown = false;
        },
        error: (error) => {
          this.results = [];
          this.snackbarService.displayError('Error getting results, try again later!');
          this.isLoaderShown = false;
        }
      })
  }

  onTabChange(index: number) {
    if (index === 0) {
      this.getFixtures();
    } else if (index === 1) {
      this.getResults();
    }
    this.matTabGroup?.realignInkBar();
  }
}

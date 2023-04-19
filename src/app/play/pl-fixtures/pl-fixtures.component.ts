import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatchFixture } from '@shared/interfaces/match.model';
import { ApiGetService } from '@shared/services/api.service';
import { MatTabGroup } from '@angular/material/tabs';
import { SnackbarService } from '@app/services/snackbar.service';

@Component({
  selector: 'app-pl-fixtures',
  templateUrl: './pl-fixtures.component.html',
  styleUrls: ['./pl-fixtures.component.scss'],
})
export class PlFixturesComponent implements OnInit, OnDestroy {

  isLoaderShown = false;
  matches: MatchFixture[] = [];
  subscriptions = new Subscription();
  selectedIndex;

  @ViewChild(MatTabGroup) matTabGroup: MatTabGroup;

  constructor(
    private apiService: ApiGetService,
    private snackbarService: SnackbarService,
  ) { }

  ngOnInit(): void {
    this.getAllMatches();
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  getAllMatches(): void {
    this.isLoaderShown = true;
    this.apiService.getAllMatches()
      .subscribe({
        next: (response) => {
          this.matches = [];
          if (response) {
            this.matches = response;
          }
          this.isLoaderShown = false;
          window.scrollTo(0, 0);
        },
        error: (error) => {
          this.matches = [];
          this.snackbarService.displayError('Error getting matches, try again later!');
          this.isLoaderShown = false;
          window.scrollTo(0, 0);
        }
      })
  }
}

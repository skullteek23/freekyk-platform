import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { SnackbarService } from '@app/services/snackbar.service';
import { MatchFixture } from '@shared/interfaces/match.model';
import { ApiGetService } from '@shared/services/api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-matches',
  templateUrl: './view-matches.component.html',
  styleUrls: ['./view-matches.component.scss']
})
export class ViewMatchesComponent implements OnInit, OnDestroy {

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

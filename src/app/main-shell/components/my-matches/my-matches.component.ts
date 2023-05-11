import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SubmitMatchRequestComponent } from '../submit-match-request/submit-match-request.component';
import { MatchFixture } from '@shared/interfaces/match.model';
import { AuthService } from '@app/services/auth.service';
import { Router } from '@angular/router';
import { ApiGetService } from '@shared/services/api.service';
import { SnackbarService } from '@shared/services/snackbar.service';

@Component({
  selector: 'app-my-matches',
  templateUrl: './my-matches.component.html',
  styleUrls: ['./my-matches.component.scss']
})
export class MyMatchesComponent implements OnInit {

  matches: MatchFixture[] = [];
  isLoaderShown = false;

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private apiGetService: ApiGetService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe({
      next: user => {
        if (user?.uid) {
          this.getUserGames(user?.uid);
        } else {
          this.redirectToUrl('/signup', 'my-matches');
        }
      }
    })
  }

  getUserGames(userID: string) {
    this.showLoader();
    this.apiGetService.getUserPickupGames(userID).subscribe({
      next: (response) => {
        if (response) {
          this.matches = response;
        } else {
          this.matches = [];
        }
        this.hideLoader();
      },
      error: () => {
        this.hideLoader();
        this.snackbarService.displayError('Error: Unable to get my matches!')
        this.matches = [];
      }
    });
  }

  openMatchRequestForm() {
    this.dialog.open(SubmitMatchRequestComponent, {
      panelClass: 'fk-dialogs'
    });
  }

  redirectToUrl(path: string, encodePath: string): void {
    const encodedString = encodeURIComponent(encodePath);
    this.router.navigate([path], { queryParams: { callback: encodedString } });
  }

  showLoader() {
    this.isLoaderShown = true;
  }

  hideLoader() {
    this.isLoaderShown = false;
  }

}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { MatchFixture } from '@shared/interfaces/match.model';
import { LeagueTableModel, } from '@shared/interfaces/others.model';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { ApiService } from '@shared/services/api.service';
import { FormControl } from '@angular/forms';
import { SnackbarService } from '@app/services/snackbar.service';
import { IKnockoutData } from '@shared/components/knockout-bracket/knockout-bracket.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pl-standings',
  templateUrl: './pl-standings.component.html',
  styleUrls: ['./pl-standings.component.scss'],
})
export class PlStandingsComponent implements OnInit, OnDestroy {

  subscriptions = new Subscription();
  seasonsList: SeasonBasicInfo[] = [];
  seasonsStrList: string[] = [];
  seasonFormControl: FormControl = new FormControl();
  isLoaderShown = false;
  leagueRowsData: LeagueTableModel[] = [];
  knockoutData: IKnockoutData = null;

  constructor(
    private apiService: ApiService,
    private snackbarService: SnackbarService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getSeasons();
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  getSeasons() {
    this.isLoaderShown = true;
    this.apiService.getSeasons()
      .subscribe({
        next: (response) => {
          this.seasonsStrList = [];
          if (response) {
            response.forEach(el => {
              if (el.cont_tour.includes('FKC') || el.cont_tour.includes('FPL')) {
                this.seasonsStrList.push(el.name);
                this.seasonsList.push(el);
              }
            });
            if (this.seasonsStrList.length) {
              this.seasonFormControl.setValue(this.seasonsStrList[0]);
              this.onSelectSeason(this.seasonsStrList[0]);
            }
          }
          this.isLoaderShown = false;
          window.scrollTo(0, 0);
        },
        error: () => {
          this.seasonsList = [];
          this.seasonsStrList = [];
          this.isLoaderShown = false;
          window.scrollTo(0, 0);
          this.snackbarService.displayError('Unable to get seasons!');
        },
      })
  }

  onSelectSeason(selection: string) {
    const selectedSeason = this.seasonsList.find(el => el.name === selection);
    if (selectedSeason) {
      this.isLoaderShown = true;
      forkJoin([
        this.apiService.getKnockoutMatches(selectedSeason.name),
        this.apiService.getLeagueTable(selectedSeason),
      ])
        .subscribe({
          next: (response) => {
            if (response?.length === 2) {
              this.knockoutData = response[0] || null;
              this.leagueRowsData = response[1] || [];
            }
            this.isLoaderShown = false;
          },
          error: (err) => {
            console.log(err)
            this.knockoutData = null;
            this.leagueRowsData = [];
            this.isLoaderShown = false;
            this.snackbarService.displayError('Season standings not found! Try again later');
          }
        })
    }
  }

  onNavigate() {
    const selectedSeason = this.seasonsList.find(el => el.name === this.seasonFormControl?.value);
    if (selectedSeason) {
      this.router.navigate(['/s', selectedSeason.id])
    }
  }


}

import { Component, OnInit } from '@angular/core';
import { ISeason } from '@shared/interfaces/season.model';
import { ApiGetService } from '@shared/services/api.service';

@Component({
  selector: 'app-join-games',
  templateUrl: './join-games.component.html',
  styleUrls: ['./join-games.component.scss']
})
export class JoinGamesComponent implements OnInit {

  instantMatchesList: ISeason[] = [];
  leaguesList: ISeason[] = [];
  knockoutGamesList: ISeason[] = [];
  isLoaderShown = false;

  constructor(
    private apiService: ApiGetService
  ) { }

  ngOnInit(): void {
    this.isLoaderShown = true;
    this.getInstantMatches();
    this.getLeagues();
    this.getKnockouts();
    window.scrollTo(0, 0);
  }

  getInstantMatches() {
    this.apiService.getCommunityPlays()
      .subscribe({
        next: (response) => {
          if (response) {
            this.instantMatchesList = response;
          }
          this.isLoaderShown = false;
        },
        error: () => {
          this.isLoaderShown = false;
          this.instantMatchesList = [];
        }
      })
  }

  getLeagues() {
    this.apiService.getLeagues()
      .subscribe({
        next: (response) => {
          if (response) {
            this.leaguesList = response;
          }
          this.isLoaderShown = false;
        },
        error: () => {
          this.isLoaderShown = false;
          this.leaguesList = [];
        }
      })
  }

  getKnockouts() {
    this.apiService.getKnockouts()
      .subscribe({
        next: (response) => {
          if (response) {
            this.knockoutGamesList = response;
          }
          this.isLoaderShown = false;
        },
        error: () => {
          this.isLoaderShown = false;
          this.knockoutGamesList = [];
        }
      })
  }

  get noGame(): boolean {
    return this.instantMatchesList.length === 0 && this.leaguesList.length === 0 && this.knockoutGamesList.length === 0;
  }
}

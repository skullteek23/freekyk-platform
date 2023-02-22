import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TeamBasicInfo } from '@shared/interfaces/team.model';
import { ApiService } from '@shared/services/api.service';

@Component({
  selector: 'app-pl-teams',
  templateUrl: './pl-teams.component.html',
  styleUrls: ['./pl-teams.component.scss'],
})
export class PlTeamsComponent implements OnInit, OnDestroy {
  teams: TeamBasicInfo[] = [];
  teamsCache: TeamBasicInfo[] = [];
  subscriptions = new Subscription();

  constructor(
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.getTeams();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getTeams(): void {
    this.apiService.getTeams()
      .subscribe({
        next: (response) => {
          if (response) {
            this.teams = response;
            this.teamsCache = JSON.parse(JSON.stringify(response));
          }
          window.scrollTo(0, 0);
        },
        error: (error) => {
          this.teams = [];
          this.teamsCache = [];
          window.scrollTo(0, 0);
        }
      })
  }

  applyFilter(searchValue: string) {
    if (searchValue) {
      const value = searchValue.trim().toLowerCase();
      this.teams = this.teamsCache.filter(team => team.tname.trim().toLowerCase().includes(value));
    } else {
      this.teams = JSON.parse(JSON.stringify(this.teamsCache));
    }
  }
}

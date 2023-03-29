import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { ITeam } from '@shared/interfaces/team.model';
import { ApiGetService } from '@shared/services/api.service';

@Component({
  selector: 'app-get-team',
  templateUrl: './get-team.component.html',
  styleUrls: ['./get-team.component.scss']
})
export class GetTeamComponent implements OnInit {

  teamsList: ITeam[] = [];
  teamsListCache: ITeam[] = [];
  isLoaderShown = false;

  constructor(
    private apiService: ApiGetService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getPlayers();
  }

  getPlayers() {
    this.isLoaderShown = true;
    this.apiService.getTeams()
      .subscribe({
        next: (response) => {
          if (response) {
            this.teamsList = response;
            this.teamsListCache = JSON.parse(JSON.stringify(response));
          }
          this.isLoaderShown = false;
          window.scrollTo(0, 0)
        },
        error: () => {
          this.teamsList = [];
          this.teamsListCache = [];
          this.isLoaderShown = false;
          window.scrollTo(0, 0)
        }
      })
  }

  openTeam(team: ITeam) {
    this.router.navigate(['/team', team.id]);
  }

  createTeam() {
    this.authService.isLoggedIn().subscribe({
      next: (user) => {
        if (user) {
          this.router.navigate(['/teams', 'create']);
        } else {
          const encodedUrl = encodeURIComponent('/teams/create');
          this.router.navigate(['/signup'], { queryParams: { callback: encodedUrl } });
        }
      }
    })
  }

  applySearch(searchValue: string) {
    if (searchValue) {
      this.teamsList = this.teamsListCache.filter(el => el.name.toLowerCase().includes(searchValue.toLowerCase()));
    } else {
      this.teamsList = JSON.parse(JSON.stringify(this.teamsListCache));
    }
  }

}

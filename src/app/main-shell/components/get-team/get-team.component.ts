import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ITeam } from '@shared/interfaces/team.model';
import { ApiGetService } from '@shared/services/api.service';

@Component({
  selector: 'app-get-team',
  templateUrl: './get-team.component.html',
  styleUrls: ['./get-team.component.scss']
})
export class GetTeamComponent implements OnInit {

  teamsList: ITeam[] = [];
  isLoaderShown = false;

  constructor(
    private apiService: ApiGetService,
    private router: Router
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
          }
          this.isLoaderShown = false;
          window.scrollTo(0, 0)
        },
        error: () => {
          this.teamsList = [];
          this.isLoaderShown = false;
          window.scrollTo(0, 0)
        }
      })
  }

  openTeam(team: ITeam) {
    this.router.navigate(['/team', team.id]);
  }

  createTeam() {
    this.router.navigate(['/teams', 'create']);
  }

}

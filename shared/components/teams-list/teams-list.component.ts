import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TeamBasicInfo } from '@shared/interfaces/team.model';

@Component({
  selector: 'app-teams-list',
  templateUrl: './teams-list.component.html',
  styleUrls: ['./teams-list.component.scss']
})
export class TeamsListComponent implements OnInit {

  @Input() team: TeamBasicInfo = null;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  openTeam() {
    this.router.navigate(['/t', this.team.tname]);
  }

}

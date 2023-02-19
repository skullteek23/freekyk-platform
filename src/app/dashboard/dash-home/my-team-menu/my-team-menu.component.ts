import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TeamService } from '@app/services/team.service';

export enum TeamMenu {
  join = 'Join a Team',
  create = 'Create a Team',
  invite = 'Invite Players',
  manage = 'Manage Team'
}
@Component({
  selector: 'app-my-team-menu',
  templateUrl: './my-team-menu.component.html',
  styleUrls: ['./my-team-menu.component.scss']
})
export class MyTeamMenuComponent implements OnInit {

  options = [
    { icon: 'add_circle', value: TeamMenu.join },
    { icon: 'group_add', value: TeamMenu.create },
    { icon: 'groups', value: TeamMenu.invite },
    { icon: 'settings', value: TeamMenu.manage }
  ]

  constructor(
    private teamService: TeamService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  onOpenOption(value: TeamMenu) {
    switch (value) {
      case TeamMenu.join:
        this.teamService.onOpenJoinTeamDialog();
        break;
      case TeamMenu.create:
        this.teamService.onOpenCreateTeamDialog();
        break;
      case TeamMenu.invite:
        this.teamService.onOpenInvitePlayersDialog();
        break;
      case TeamMenu.manage:
        this.router.navigate(['/dashboard', 'team-management'])
        break;
    }
  }

}

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-team-menu',
  templateUrl: './my-team-menu.component.html',
  styleUrls: ['./my-team-menu.component.scss']
})
export class MyTeamMenuComponent implements OnInit {

  options = [
    { icon: 'add_circle', value: 'Join a Team' },
    { icon: 'group_add', value: 'Create a Team' },
    { icon: 'groups', value: 'View Invites' },
    { icon: 'settings', value: 'Manage Team' }
  ]

  constructor() { }

  ngOnInit(): void {
  }

}

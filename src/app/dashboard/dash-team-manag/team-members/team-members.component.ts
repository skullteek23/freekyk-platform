import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ITeamPlayer } from '@shared/components/team-player-members-list/team-player-members-list.component';
import { ApiGetService } from '@shared/services/api.service';

@Component({
  selector: 'app-team-members',
  templateUrl: './team-members.component.html',
  styleUrls: ['./team-members.component.scss']
})
export class TeamMembersComponent implements OnInit {

  @Input() set members(value: string[]) {
    this.getTeamMembers(value);
  }

  @Input() captainID = null;

  membersList: ITeamPlayer[] = [];

  constructor(
    private apiService: ApiGetService,
    private router: Router
  ) { }

  ngOnInit(): void { }

  getTeamMembers(list: string[]) {
    if (list?.length) {
      this.apiService.getTeamPlayers(list)
        .subscribe({
          next: (response) => {
            if (response) {
              this.membersList = response;
            }
          },
          error: () => {
            this.membersList = [];
          }
        })
    }
    // this.subscriptions.add(
    //   this.store
    //     .select('team')
    //     .subscribe((response) => {
    //       if (response?.basicInfo?.captainId) {
    //         this.captainID = response.basicInfo.captainId;
    //         this.isCaptain = this.captainID === localStorage.getItem('uid');
    //       } else {
    //         this.captainID = null;
    //         this.isCaptain = false;
    //       }
    //       if (response?.teamMembers?.members?.length) {
    //         this.members = JSON.parse(JSON.stringify(response.teamMembers.members)) as Tmember[];
    //         this.members.sort(ArraySorting.sortObjectByKey('name'));
    //       } else {
    //         this.members = [];
    //       }
    //     })
    // );
  }

  manageTeam() {
    this.router.navigate(['/my-team/settings']);
  }

  openInviteDialog() {
    this.router.navigate(['/my-team/invite']);
  }

  openJoinTeam() {
    this.router.navigate(['/my-team/join']);
  }

}

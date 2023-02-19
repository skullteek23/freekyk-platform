import { Component, OnDestroy, OnInit } from '@angular/core';
import { TeamService } from '@app/services/team.service';
import { Store } from '@ngrx/store';
import { Tmember } from '@shared/interfaces/team.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TeamState } from '../store/team.reducer';

@Component({
  selector: 'app-team-members',
  templateUrl: './team-members.component.html',
  styleUrls: ['./team-members.component.scss']
})
export class TeamMembersComponent implements OnInit, OnDestroy {

  members: Tmember[] = [];
  captainID: string = null;
  subscriptions = new Subscription();
  isCaptain = false;

  constructor(
    private teamService: TeamService,
    private store: Store<{ team: TeamState }>
  ) { }

  ngOnInit(): void {
    this.getTeamMembers();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getTeamMembers() {
    this.subscriptions.add(
      this.store
        .select('team')
        .subscribe((response) => {
          if (response?.basicInfo?.captainId) {
            this.captainID = response.basicInfo.captainId;
            this.isCaptain = this.captainID === localStorage.getItem('uid');
          } else {
            this.captainID = null;
            this.isCaptain = false;
          }
          if (response?.teamMembers?.members?.length) {
            this.members = JSON.parse(JSON.stringify(response.teamMembers.members)) as Tmember[];
            this.members.sort(ArraySorting.sortObjectByKey('name'));
          } else {
            this.members = [];
          }
        })
    );
  }

  onManageMembers() {
    this.teamService.onOpenManageMembersDialog();
  }

  openInviteDialog() {
    this.teamService.onOpenInvitePlayersDialog();
  }

  openJoinTeam() {
    this.teamService.onOpenJoinTeamDialog();
  }

}

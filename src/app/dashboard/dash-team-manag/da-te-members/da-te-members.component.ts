import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { tap, map, share } from 'rxjs/operators';
import { TeamService } from 'src/app/services/team.service';
import { TeamMembers } from 'src/app/shared/interfaces/team.model';
import { TeamState } from '../store/team.reducer';

@Component({
  selector: 'app-da-te-members',
  templateUrl: './da-te-members.component.html',
  styleUrls: ['./da-te-members.component.css'],
})
export class DaTeMembersComponent implements OnInit {
  ind: number;
  noTeam: boolean = true;
  teamMembers: TeamMembers;
  isLoading: boolean = true;
  capId$: Observable<string>;
  constructor(
    private teServ: TeamService,
    private store: Store<{ team: TeamState }>
  ) {
    this.capId$ = this.store.select('team').pipe(
      map((resp) => resp.basicInfo.captainId),
      share()
    );
    store
      .select('team')
      .pipe(
        tap((info) => {
          this.noTeam = info.basicInfo.tname == null;
          this.ind = this.noTeam ? 0 : 1;
          this.isLoading = false;
        }),
        map((info) => info.teamMembers)
      )
      .subscribe((members) => (this.teamMembers = members));
  }
  ngOnInit(): void {}

  onOpenTeamSettings() {
    this.teServ.onOpenTeamSettingsDialog();
  }
  createTeam() {
    this.teServ.onOpenCreateTeamDialog();
  }
  joinTeam() {
    this.teServ.onOpenJoinTeamDialog();
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { tap, map, share } from 'rxjs/operators';
import { TeamService } from 'src/app/services/team.service';
import { TeamMembers } from '@shared/interfaces/team.model';
import { TeamState } from '../store/team.reducer';

@Component({
  selector: 'app-da-te-members',
  templateUrl: './da-te-members.component.html',
  styleUrls: ['./da-te-members.component.css'],
})
export class DaTeMembersComponent implements OnInit, OnDestroy {
  ind: number;
  noTeam = true;
  teamMembers: TeamMembers;
  isLoading = true;
  capId$: Observable<string>;
  subscriptions = new Subscription();
  constructor(
    private teServ: TeamService,
    private store: Store<{ team: TeamState }>
  ) { }
  ngOnInit(): void {
    this.capId$ = this.store.select('team').pipe(
      map((resp) => resp.basicInfo.captainId),
      share()
    );
    this.subscriptions.add(
      this.store
        .select('team')
        .pipe(
          tap((info) => {
            this.noTeam = info.basicInfo.tname == null;
            this.ind = this.noTeam ? 0 : 1;
            this.isLoading = false;
          }),
          map((info) => info.teamMembers)
        )
        .subscribe((members) => (this.teamMembers = members))
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onOpenTeamSettings(): void {
    this.teServ.onOpenTeamSettingsDialog();
  }
  createTeam(): void {
    this.teServ.onOpenCreateTeamDialog();
  }
  joinTeam(): void {
    this.teServ.onOpenJoinTeamDialog();
  }
}

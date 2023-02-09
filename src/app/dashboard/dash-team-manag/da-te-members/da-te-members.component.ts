import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { tap, map, share } from 'rxjs/operators';
import { TeamService } from 'src/app/services/team.service';
import { Tmember } from '@shared/interfaces/team.model';
import { TeamState } from '../store/team.reducer';
import { ArraySorting } from '@shared/utils/array-sorting';

@Component({
  selector: 'app-da-te-members',
  templateUrl: './da-te-members.component.html',
  styleUrls: ['./da-te-members.component.scss'],
})
export class DaTeMembersComponent implements OnInit, OnDestroy {

  ind: number = 0;
  noTeam = true;
  membersList: Tmember[] = [];
  isLoading = true;
  capId$: Observable<string>;
  subscriptions = new Subscription();

  constructor(
    private teamService: TeamService,
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
            this.isLoading = false;
          }),
          map((info) => info.teamMembers)
        )
        .subscribe((members) => {
          if (members) {
            this.membersList = members.members.slice();
            this.membersList.sort(ArraySorting.sortObjectByKey('name'));
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onOpenTeamSettings(): void {
    this.teamService.onOpenTeamSettingsDialog();
  }

  createTeam(): void {
    this.teamService.onOpenCreateTeamDialog();
  }

  joinTeam(): void {
    this.teamService.onOpenJoinTeamDialog();
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { CAPTAIN_ONLY, Tmember } from 'src/app/shared/interfaces/team.model';
import { TeamService } from 'src/app/services/team.service';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TeamState } from '../../store/team.reducer';
import { ConfirmationBoxComponent } from 'src/app/shared/dialogs/confirmation-box/confirmation-box.component';

@Component({
  selector: 'app-da-te-mang-players',
  templateUrl: './da-te-mang-players.component.html',
  styleUrls: ['./da-te-mang-players.component.css'],
})
export class DaTeMangPlayersComponent implements OnInit {
  @Input() margin: boolean = false;
  @Input('membersArray') teamMembers: Tmember[] = [];
  plFilters = ['Playing Position'];
  capId$: Observable<string>;
  uid: string;
  constructor(
    private dialog: MatDialog,
    private snackServ: SnackbarService,
    private router: Router,
    private teamServ: TeamService,
    private store: Store<{ team: TeamState }>
  ) {
    this.uid = localStorage.getItem('uid');
    this.capId$ = this.store
      .select('team')
      .pipe(map((resp) => resp.basicInfo.captainId));
  }
  ngOnInit(): void {}
  onDeleteTeam() {
    this.store
      .select('team')
      .pipe(
        tap((resp) => {
          if (resp.basicInfo.captainId != this.uid)
            this.teamServ.handlePermissionErrors(CAPTAIN_ONLY);
        }),
        filter((resp) => resp.basicInfo.captainId == this.uid),
        take(1),
        switchMap(() => {
          return this.dialog
            .open(ConfirmationBoxComponent)
            .afterClosed()
            .pipe(filter((resp) => !!resp == true));
        })
      )
      .subscribe(() => this.teamServ.onDeleteTeam());
  }
  onRemovePlayer(pid: string) {
    this.store
      .select('team')
      .pipe(
        tap((resp) => {
          if (resp.basicInfo.captainId != this.uid)
            this.teamServ.handlePermissionErrors(CAPTAIN_ONLY);
        }),
        filter((resp) => resp.basicInfo.captainId == this.uid),
        take(1),
        switchMap(() => {
          return this.dialog
            .open(ConfirmationBoxComponent)
            .afterClosed()
            .pipe(filter((resp) => !!resp == true));
        })
      )
      .subscribe(() =>
        this.teamServ
          .onRemovePlayer(pid, this.teamMembers)
          .then(() =>
            this.snackServ.displayCustomMsg(
              'Player successfully removed from the team!'
            )
          )
      );
  }
  onLeaveTeam() {
    this.store
      .select('team')
      .pipe(
        filter((resp) => resp.basicInfo.captainId != this.uid),
        take(1),
        switchMap(() => {
          return this.dialog
            .open(ConfirmationBoxComponent)
            .afterClosed()
            .pipe(filter((resp) => !!resp == true));
        })
      )
      .subscribe(() =>
        this.teamServ.onLeaveTeam(this.teamMembers).then(() => {
          this.snackServ.displayCustomMsg(
            'You have successfully left the team!'
          );
          location.reload();
        })
      );
  }
}

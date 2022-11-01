import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { CAPTAIN_ONLY, Tmember } from '@shared/interfaces/team.model';
import { TeamService } from 'src/app/services/team.service';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { TeamState } from '../../store/team.reducer';
import { ConfirmationBoxComponent } from '@shared/dialogs/confirmation-box/confirmation-box.component';

@Component({
  selector: 'app-da-te-mang-players',
  templateUrl: './da-te-mang-players.component.html',
  styleUrls: ['./da-te-mang-players.component.css'],
})
export class DaTeMangPlayersComponent implements OnInit, OnDestroy {
  @Input() margin = false;
  @Input() membersArray: Tmember[] = [];
  plFilters = ['Playing Position'];
  capId$: Observable<string>;
  uid: string;
  subscriptions = new Subscription();
  constructor(
    private dialog: MatDialog,
    private snackServ: SnackbarService,
    private router: Router,
    private teamServ: TeamService,
    private store: Store<{ team: TeamState }>
  ) { }
  ngOnInit(): void {
    this.uid = localStorage.getItem('uid');
    this.capId$ = this.store
      .select('team')
      .pipe(map((resp) => resp.basicInfo.captainId));
  }
  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
  onDeleteTeam(): void {
    this.subscriptions.add(
      this.store
        .select('team')
        .pipe(
          tap((resp) => {
            if (resp.basicInfo.captainId != this.uid) {
              this.teamServ.handlePermissionErrors(CAPTAIN_ONLY);
            }
          }),
          filter((resp) => resp.basicInfo.captainId === this.uid),
          take(1),
          switchMap(() => this.dialog
            .open(ConfirmationBoxComponent)
            .afterClosed()
            .pipe(filter((resp) => !!resp === true)))
        )
        .subscribe(() => this.teamServ.onDeleteTeam())
    );
  }
  onRemovePlayer(pid: string): void {
    this.subscriptions.add(
      this.store
        .select('team')
        .pipe(
          tap((resp) => {
            if (resp.basicInfo.captainId !== this.uid) {
              this.teamServ.handlePermissionErrors(CAPTAIN_ONLY);
            }
          }),
          filter((resp) => resp.basicInfo.captainId === this.uid),
          take(1),
          switchMap(() => this.dialog
            .open(ConfirmationBoxComponent)
            .afterClosed()
            .pipe(filter((resp) => !!resp === true)))
        )
        .subscribe(() =>
          this.teamServ
            .onRemovePlayer(pid, this.membersArray)
            .then(() =>
              this.snackServ.displayCustomMsg(
                'Player successfully removed from the team!'
              )
            )
        )
    );
  }
  onLeaveTeam(): void {
    this.subscriptions.add(
      this.store
        .select('team')
        .pipe(
          filter((resp) => resp.basicInfo.captainId != this.uid),
          take(1),
          switchMap(() => this.dialog
            .open(ConfirmationBoxComponent)
            .afterClosed()
            .pipe(filter((resp) => !!resp === true)))
        )
        .subscribe(() =>
          this.teamServ.onLeaveTeam(this.membersArray).then(() => {
            this.snackServ.displayCustomMsg(
              'You have successfully left the team!'
            );
            location.reload();
          })
        )
    );
  }
}

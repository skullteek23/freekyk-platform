import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { SnackbarService } from '@shared/services/snackbar.service';
import { CAPTAIN_ONLY, Tmember } from '@shared/interfaces/team.model';
import { TeamService } from 'src/app/services/team.service';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { TeamState } from '../../store/team.reducer';
import { ConfirmationBoxComponent } from '@shared/dialogs/confirmation-box/confirmation-box.component';

@Component({
  selector: 'app-da-te-mang-players',
  templateUrl: './da-te-mang-players.component.html',
  styleUrls: ['./da-te-mang-players.component.scss'],
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
    private snackBarService: SnackbarService,
    private teamService: TeamService,
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
              this.teamService.handlePermissionErrors(CAPTAIN_ONLY);
            }
          }),
          filter((resp) => resp.basicInfo.captainId === this.uid),
          take(1),
          switchMap(() => this.dialog
            .open(ConfirmationBoxComponent)
            .afterClosed()
            .pipe(filter((resp) => !!resp === true)))
        )
        .subscribe(() => this.teamService.onDeleteTeam())
    );
  }

  onRemovePlayer(pid: string): void {
    this.subscriptions.add(
      this.store
        .select('team')
        .pipe(
          tap((resp) => {
            if (resp.basicInfo.captainId !== this.uid) {
              this.teamService.handlePermissionErrors(CAPTAIN_ONLY);
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
          this.teamService
            .onRemovePlayer(pid, this.membersArray)
            .then(() =>
              this.snackBarService.displayCustomMsg(
                'Player successfully removed from the team!'
              )
            )
            .catch(() => this.snackBarService.displayError())
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
          this.teamService.onLeaveTeam(this.membersArray)
            .then(() => {
              this.snackBarService.displayCustomMsg(
                'You have successfully left the team!'
              );
              location.reload();
            })
            .catch(() => this.snackBarService.displayError())
        )
    );
  }
}

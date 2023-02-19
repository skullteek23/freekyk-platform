import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TeamState } from '@app/dashboard/dash-team-manag/store/team.reducer';
import { SnackbarService } from '@app/services/snackbar.service';
import { TeamService } from '@app/services/team.service';
import { Store } from '@ngrx/store';
import { ConfirmationBoxComponent } from '@shared/dialogs/confirmation-box/confirmation-box.component';
import { Tmember } from '@shared/interfaces/team.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-manage-members',
  templateUrl: './manage-members.component.html',
  styleUrls: ['./manage-members.component.scss']
})
export class ManageMembersComponent implements OnInit, OnDestroy {

  subscriptions = new Subscription();
  members: Tmember[] = [];
  captainID: string = null;

  constructor(
    public dialogRef: MatDialogRef<ManageMembersComponent>,
    private store: Store<{ team: TeamState }>,
    private teamService: TeamService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService
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
          } else {
            this.captainID = null;
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

  onRemovePlayer(playerID: string) {
    if (playerID) {
      this.dialog.open(ConfirmationBoxComponent)
        .afterClosed()
        .subscribe(response => {
          if (response) {
            this.teamService.onRemovePlayer(playerID, this.members)
              .then(() => this.snackbarService.displayCustomMsg('Player removed from the team!'))
              .catch(error => this.snackbarService.displayError());
          }
        })
    }
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

}

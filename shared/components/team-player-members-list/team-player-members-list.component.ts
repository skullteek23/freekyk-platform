import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlayerCardComponent } from '@shared/dialogs/player-card/player-card.component';
import { Tmember } from '@shared/interfaces/team.model';

@Component({
  selector: 'app-team-player-members-list',
  templateUrl: './team-player-members-list.component.html',
  styleUrls: ['./team-player-members-list.component.scss']
})
export class TeamPlayerMembersListComponent implements OnInit {
  @Input() list: Tmember[] = [];
  @Input() captainID: string = null;

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  openPlayerProfile(playerID: string) {
    const dialogRef = this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: playerID,
    });
  }

}

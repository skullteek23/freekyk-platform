import { Component, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlayerCardComponent } from '@shared/dialogs/player-card/player-card.component';
import { Tmember } from '@shared/interfaces/team.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-team-player-members-list',
  templateUrl: './team-player-members-list.component.html',
  styleUrls: ['./team-player-members-list.component.scss']
})
export class TeamPlayerMembersListComponent implements OnInit {
  @Input() set list(value: Tmember[]) {
    if (value) {
      value.sort(ArraySorting.sortObjectByKey('pl_pos'));
      this.members = value;
    }
  }
  @Input() captainID: string = null;
  @Input() showProfileButton = true;
  @Input() showRemoveButton = false;

  @Output() selectRemovePlayer = new Subject<string>();

  members: Tmember[] = [];

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit(): void { }

  openPlayerProfile(playerID: string) {
    const dialogRef = this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: playerID,
    });
  }

  removePlayer(pid: string) {
    this.selectRemovePlayer.next(pid);
  }
}

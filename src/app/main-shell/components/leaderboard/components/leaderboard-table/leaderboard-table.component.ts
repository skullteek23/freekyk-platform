import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { PlayerCardComponent } from '@shared/dialogs/player-card/player-card.component';

export interface ILeaderBoardTableData {
  name: string;
  imgpath: string;
  id: string;
  statistic: number;
}

@Component({
  selector: 'app-leaderboard-table',
  templateUrl: './leaderboard-table.component.html',
  styleUrls: ['./leaderboard-table.component.scss']
})
export class LeaderboardTableComponent implements OnInit {

  @Input() set data(value: ILeaderBoardTableData[]) {
    if (value) {
      this.setDataSource(value);
    }
  }

  @Input() displayedColumns = ['player', 'stats'];
  @Input() columnB = '';

  dataSource = null

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  openPlayerCard(playerID: string) {
    this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: playerID,
    });
  }

  setDataSource(value: ILeaderBoardTableData[]) {
    this.dataSource = new MatTableDataSource<ILeaderBoardTableData>(value);
  }

}

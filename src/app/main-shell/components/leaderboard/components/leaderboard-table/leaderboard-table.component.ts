import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from '@app/services/auth.service';
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
export class LeaderboardTableComponent implements OnInit, OnDestroy {

  @Input() set data(value: ILeaderBoardTableData[]) {
    if (value) {
      this.setDataSource(value);
    }
  }

  @Input() columnB = '';

  displayedColumns = ['name', 'statistic'];
  dataSource = new MatTableDataSource<ILeaderBoardTableData>([]);
  uid: string = null;

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private dialog: MatDialog,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe({
      next: (user) => {
        if (user) {
          this.uid = user.uid;
        }
      }
    })
  }

  ngOnDestroy(): void {
    this.dataSource.disconnect();
  }

  openPlayerCard(playerID: string) {
    this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: playerID,
    });
  }

  setDataSource(value: ILeaderBoardTableData[]) {
    this.dataSource.data = value;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = ((data, sortHeaderId) => {
      if (typeof data[sortHeaderId] === 'string') {
        return data[sortHeaderId].toLowerCase();
      } else {
        return data[sortHeaderId];
      }
    })
  }

}

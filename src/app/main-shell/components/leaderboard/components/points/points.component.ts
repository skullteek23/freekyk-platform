import { Component, OnInit } from '@angular/core';
import { LeaderboardService } from '@app/main-shell/services/leaderboard.service';
import { ILeaderBoardTableData } from '../leaderboard-table/leaderboard-table.component';

@Component({
  selector: 'app-points',
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.scss']
})
export class PointsComponent implements OnInit {
  list: ILeaderBoardTableData[] = null;

  constructor(
    private leaderboardService: LeaderboardService
  ) { }

  ngOnInit(): void {
    this.leaderboardService._players().subscribe(response => {

      this.list = this.leaderboardService.parseStats(response, 'apps');
    });
  }

}

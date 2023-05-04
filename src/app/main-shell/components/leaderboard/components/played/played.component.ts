import { Component, OnInit } from '@angular/core';
import { ILeaderBoardTableData } from '../leaderboard-table/leaderboard-table.component';
import { LeaderboardService } from '@app/main-shell/services/leaderboard.service';

@Component({
  selector: 'app-played',
  templateUrl: './played.component.html',
  styleUrls: ['./played.component.scss']
})
export class PlayedComponent implements OnInit {

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

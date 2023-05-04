import { Component, OnInit } from '@angular/core';
import { LeaderboardService } from '@app/main-shell/services/leaderboard.service';
import { ILeaderBoardTableData } from '../leaderboard-table/leaderboard-table.component';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss']
})
export class GoalsComponent implements OnInit {

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

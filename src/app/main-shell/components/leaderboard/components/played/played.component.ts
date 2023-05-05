import { Component, OnDestroy, OnInit } from '@angular/core';
import { ILeaderBoardTableData } from '../leaderboard-table/leaderboard-table.component';
import { LeaderboardService } from '@app/main-shell/services/leaderboard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-played',
  templateUrl: './played.component.html',
  styleUrls: ['./played.component.scss']
})
export class PlayedComponent implements OnInit, OnDestroy {

  list: ILeaderBoardTableData[] = null;
  subscriptions = new Subscription();

  constructor(
    private leaderboardService: LeaderboardService
  ) { }

  ngOnInit(): void {
    this.showLoader();
    this.subscriptions.add(this.leaderboardService._players().subscribe(response => {
      this.list = this.leaderboardService.parseStats(response, 'apps');
      this.hideLoader();
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  showLoader() {
    this.leaderboardService.showLoader();
  }

  hideLoader() {
    this.leaderboardService.hideLoader();
  }
}

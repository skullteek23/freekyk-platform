import { Component, OnDestroy, OnInit } from '@angular/core';
import { LeaderboardService } from '@app/main-shell/services/leaderboard.service';
import { ILeaderBoardTableData } from '../leaderboard-table/leaderboard-table.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss']
})
export class GoalsComponent implements OnInit, OnDestroy {

  list: ILeaderBoardTableData[] = null;
  subscriptions = new Subscription();

  constructor(
    private leaderboardService: LeaderboardService
  ) { }

  ngOnInit(): void {
    this.showLoader();
    this.subscriptions.add(this.leaderboardService._players().subscribe(response => {
      this.list = this.leaderboardService.parseStats(response, 'g');
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

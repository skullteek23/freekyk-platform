import { Component, OnDestroy, OnInit } from '@angular/core';
import { LeaderboardService } from '@app/main-shell/services/leaderboard.service';
import { ILeaderBoardTableData } from '../leaderboard-table/leaderboard-table.component';
import { ApiGetService } from '@shared/services/api.service';
import { Subscription, combineLatest } from 'rxjs';
import { PlayerAllInfo } from '@shared/utils/pipe-functions';
import { IPoint } from '@shared/interfaces/reward.model';

export interface PlayerPointsInfo extends PlayerAllInfo, IPoint { };

@Component({
  selector: 'app-points',
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.scss']
})
export class PointsComponent implements OnInit, OnDestroy {
  list: ILeaderBoardTableData[] = null;
  subscription = new Subscription();

  constructor(
    private leaderboardService: LeaderboardService,
    private apiGetService: ApiGetService
  ) { }

  ngOnInit(): void {
    this.getPoints();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getPoints() {
    this.showLoader();
    this.subscription.add(combineLatest([
      this.leaderboardService._players(),
      this.apiGetService.getPoints()
    ]).subscribe({
      next: (response) => {
        let mixed: PlayerPointsInfo[] = [];
        const players = response[0];
        const points = response[1];
        if (response?.length === 2 && players.length && points.length) {
          mixed = players.reduce((acc, playerA) => {
            const playerB = points.find((player) => player.id === playerA.id);
            if (playerB) {
              acc.push({ ...playerA, ...playerB });
            }
            return acc;
          }, []);
        }
        this.list = this.leaderboardService.parseStats(mixed, 'points');
        this.hideLoader();
      }, error: (error) => {
        this.list = [];
        this.hideLoader();
      }
    }));
  }

  showLoader() {
    this.leaderboardService.showLoader();
  }

  hideLoader() {
    this.leaderboardService.hideLoader();
  }
}

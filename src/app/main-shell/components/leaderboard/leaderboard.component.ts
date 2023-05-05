import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LeaderboardService } from '@app/main-shell/services/leaderboard.service';
import { ListOption } from '@shared/interfaces/others.model';
import { ApiGetService } from '@shared/services/api.service';
import { PlayerAllInfo } from '@shared/utils/pipe-functions';
import { Subscription, forkJoin } from 'rxjs';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit, OnDestroy {

  activeLink = '';
  subscriptions = new Subscription();
  isLoaderShown = false;
  links: ListOption[] = [
    { value: '/leaderboard/played', viewValue: 'Played' },
    { value: '/leaderboard/goals', viewValue: 'Goals' },
    { value: '/leaderboard/points', viewValue: 'Points' },
  ];

  constructor(
    private router: Router,
    private apiGetService: ApiGetService,
    private leaderboardService: LeaderboardService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.router.events.subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          this.activeLink = event.url.slice('/leaderboard/'.length);
          window.scrollTo(0, 0);
        }
      })
    );
    this.leaderboardService._loading().subscribe({
      next: (status) => {
        if (status) {
          this.showLoader();
        } else {
          this.hideLoader();
        }
      }
    })
    this.getStats();
  }

  getStats() {
    this.showLoader();
    forkJoin([
      this.apiGetService.getPlayers(),
      this.apiGetService.getPlayersStats()
    ]).subscribe({
      next: response => {
        let mixed: PlayerAllInfo[] = [];
        if (response?.length === 2 && response[0].length && response[1].length) {
          mixed = response[0].reduce((acc, playerA) => {
            const playerB = response[1].find((player) => player.id === playerA.id);
            if (playerB) {
              acc.push({ ...playerA, ...playerB });
            }
            return acc;
          }, []);
        }
        this.leaderboardService.setPlayerList(mixed);
        this.hideLoader();
      },
      error: () => {
        this.leaderboardService.setPlayerList([]);
        this.hideLoader();
      }
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  showLoader() {
    this.isLoaderShown = true;
  }

  hideLoader() {
    this.isLoaderShown = false;
  }

}

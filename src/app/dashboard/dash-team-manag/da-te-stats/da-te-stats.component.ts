import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { statsIcon } from 'src/app/shared/interfaces/others.model';
import { AppState } from 'src/app/store/app.reducer';

@Component({
  selector: 'app-da-te-stats',
  templateUrl: './da-te-stats.component.html',
  styleUrls: ['./da-te-stats.component.css'],
})
export class DaTeStatsComponent implements OnInit, OnDestroy {
  Stats: statsIcon[];
  tournamentWins: any[];
  noPremiumWon = true;
  subscriptions = new Subscription();
  constructor(private store: Store<AppState>) { }
  ngOnInit(): void {
    this.subscriptions.add(
      this.store
        .select('team')
        .pipe(
          map((info) => info.stats),
          map((stats) => {
            if (+stats.pr_tour_wins !== 0) {
              this.tournamentWins = new Array(stats.pr_tour_wins);
            }
            this.noPremiumWon = +stats.pr_tour_wins === 0;
            let newArray: statsIcon[] = [];
            newArray = [
              {
                icon: 'sports_soccer',
                name: 'FKC Played',
                value: stats.fkc_played,
              },
              {
                icon: 'sports_soccer',
                name: 'FCP Played',
                value: stats.fcp_played,
              },
              {
                icon: 'sports_soccer',
                name: 'FPL Played',
                value: stats.fpl_played,
              },
              { icon: 'sports_soccer', name: 'Goals', value: stats.g },
              { icon: 'flag', name: 'Wins', value: stats.w },
              { icon: 'cancel_presentation', name: 'Losses', value: stats.l },
              { icon: 'style', name: 'Red cards', value: stats.rcards },
              { icon: 'style', name: 'Yellow cards', value: stats.ycards },
              {
                icon: 'cancel',
                name: 'Goals Conceded',
                value: stats.g_conceded,
              },
            ];

            return newArray;
          })
        )
        .subscribe((stats) => (this.Stats = stats))
    );
  }
  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
}

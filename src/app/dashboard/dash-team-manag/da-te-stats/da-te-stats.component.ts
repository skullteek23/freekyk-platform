import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { TeamService } from 'src/app/services/team.service';
import { statsIcon } from 'src/app/shared/interfaces/others.model';
import { AppState } from 'src/app/store/app.reducer';

@Component({
  selector: 'app-da-te-stats',
  templateUrl: './da-te-stats.component.html',
  styleUrls: ['./da-te-stats.component.css'],
})
export class DaTeStatsComponent implements OnInit {
  Stats: statsIcon[];
  tour_wins: any[];
  noPremiumWon: boolean = true;
  constructor(private teServ: TeamService, private store: Store<AppState>) {
    store
      .select('team')
      .pipe(
        map((info) => info.stats),
        map((stats) => {
          // console.log(stats.pr_tour_wins);
          if (+stats.pr_tour_wins != 0) {
            this.noPremiumWon = false;
            this.tour_wins = new Array(stats.pr_tour_wins);
          } else this.noPremiumWon = true;
          let newArray: statsIcon[] = [];
          let i = 0;
          newArray = [
            {
              icon: 'sports_soccer',
              name: 'FKC Played',
              value: stats.played.fkc,
            },
            {
              icon: 'sports_soccer',
              name: 'FCP Played',
              value: stats.played.fcp,
            },
            {
              icon: 'sports_soccer',
              name: 'FPL Played',
              value: stats.played.fpl,
            },
            { icon: 'sports_soccer', name: 'Goals', value: stats.g },
            { icon: 'flag', name: 'Wins', value: stats.w },
            { icon: 'cancel_presentation', name: 'Losses', value: stats.l },
            { icon: 'style', name: 'Red cards', value: stats.rcards },
            { icon: 'style', name: 'Yellow cards', value: stats.ycards },
            { icon: 'cancel', name: 'Goals Conceded', value: stats.g_conceded },
            {
              icon: 'insert_drive_file',
              name: 'Clean Sheets',
              value: stats.cl_sheet,
            },
          ];

          return newArray;
        })
      )
      .subscribe((stats) => (this.Stats = stats));
  }
  ngOnInit(): void {}
}

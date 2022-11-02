import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlayerService } from 'src/app/services/player.service';
import { statsIcon } from '@shared/interfaces/others.model';

@Component({
  selector: 'app-da-ho-stats-card',
  templateUrl: './da-ho-stats-card.component.html',
  styleUrls: ['./da-ho-stats-card.component.scss'],
})
export class DaHoStatsCardComponent implements OnInit {
  isLoading = true;
  statsIconsFs: statsIcon[] = [];
  plStats$: Observable<statsIcon[]>;
  fsStats$: Observable<statsIcon[]>;
  constructor(private plServ: PlayerService) { }
  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
    const uid = localStorage.getItem('uid');
    if (uid) {
      this.plStats$ = this.plServ.fetchPlayerStats(uid).pipe(
        map((stats) => {
          let newArray: statsIcon[] = [];
          newArray = [
            {
              icon: 'sports_soccer',
              name: 'Appearances',
              value: stats.apps,
            },
            { icon: 'sports_soccer', name: 'Goals', value: stats.g },
            { icon: 'flag', name: 'Wins', value: stats.w },
            { icon: 'style', name: 'Red Cards', value: stats.rcards },
            { icon: 'style', name: 'Yellow Cards', value: stats.ycards },
            { icon: 'cancel_presentation', name: 'Losses', value: stats.l },
          ];
          return newArray;
        })
      );
      this.fsStats$ = this.plServ.fetchFsStats(uid).pipe(
        map((stats) => {
          const newArray: statsIcon[] = [
            { icon: 'stars', name: 'Skill Level', value: stats.sk_lvl },
            {
              icon: 'group_work',
              name: 'Brand Collaborations',
              value: stats.br_colb.length,
            },
            {
              icon: 'check_circle',
              name: 'Tricks (completed)',
              value: stats.tr_a,
            },
            { icon: 'schedule', name: 'Tricks (waiting)', value: stats.tr_w },
            { icon: 'error', name: 'Tricks (unapproved)', value: stats.tr_u },
          ];
          return newArray;
        })
      );
    }
  }
}

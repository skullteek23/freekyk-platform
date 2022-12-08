import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MatchFixture, TournamentTypes } from '@shared/interfaces/match.model';
import { CommunityLeaderboard, FilterData, LeagueTableModel, } from '@shared/interfaces/others.model';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { PlayConstants } from '../play.constants';

@Component({
  selector: 'app-pl-standings',
  templateUrl: './pl-standings.component.html',
  styleUrls: ['./pl-standings.component.scss'],
})
export class PlStandingsComponent implements OnInit, OnDestroy {

  activeIndex = 0;
  cpStandings: CommunityLeaderboard[] = [];
  filterData: FilterData;
  knockoutFixtures: MatchFixture[] = [];
  leagueData: LeagueTableModel[] = [];
  onMobile = false;
  subscriptions = new Subscription();
  @Input() seasonChosen = null;

  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;

  constructor(
    private ngFire: AngularFirestore,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.filterData = {
      defaultFilterPath: '',
      filtersObj: {},
    };
    if (this.seasonChosen) {
      this.onQuerySeason(this.seasonChosen);
    } else {
      this.subscriptions.add(
        this.route.queryParams.subscribe((params) => {
          if (params && Object.keys(params).length) {
            this.onQuerySeason(Object.values(params)[0]);
          } else {
            this.onQuerySeason(null);
          }
        })
      );
    }
    this.ngFire
      .collection('seasons')
      .get()
      .pipe(
        map((resp) =>
          resp.docs.map((doc) => (doc.data() as SeasonBasicInfo).name)
        )
      )
      .subscribe((resp) => {
        this.filterData = {
          defaultFilterPath: 'standings',
          filtersObj: {
            Season: resp,
          },
        };
      });
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  onQueryData(queryInfo): void {
    if (queryInfo) {
      const queryParamKey = queryInfo?.queryItem;
      this.router.navigate(['/play', 'standings'], { queryParams: { [queryParamKey]: queryInfo.queryValue } });
    } else {
      this.seasonChosen = null;
    }
  }

  onQuerySeason(seasonName: string): void {
    if (seasonName) {
      this.seasonChosen = seasonName;
      forkJoin([this.getMatchesByType('FKC'), this.getMatchesByType('FCP'), this.getSeasonID()])
        .pipe(switchMap(resp => {
          if (resp && resp[2] && resp.length === 3) {
            this.knockoutFixtures = resp[0] as MatchFixture[];
            this.cpStandings = (resp[1] as MatchFixture[]).map(element => {
              const penaltyScores: string[] = element?.tie_breaker?.split('-');
              let winner = PlayConstants.MATCH_DRAW;
              if (element?.home?.score > element?.away?.score) {
                winner = element.home.name;
              } else if (element?.home?.score < element?.away?.score) {
                winner = element.home.name;
              } else if (penaltyScores && penaltyScores.length === 2 && element.hasOwnProperty('tie_breaker') && element.tie_breaker !== '') {
                winner = penaltyScores[0] > penaltyScores[1] ? element.home.name : element.away.name;
              } else if (!element.concluded) {
                winner = PlayConstants.TO_BE_DECIDED;
              }
              const CPdata: CommunityLeaderboard = {
                home: {
                  name: element.home.name,
                  logo: element.home.logo,
                },
                away: {
                  name: element.away.name,
                  logo: element.away.logo,
                },
                winner,
                stadium: element.stadium,
              };
              return CPdata;
            });
            return this.ngFire.collection('leagues').doc(resp[2]).get();
          } else {
            return null;
          }
        }))
        .subscribe(response => {
          if (response) {
            const data = response.data() as LeagueTableModel;
            this.leagueData = response.exists && data ? Object.values(data) : [];
            this.updateSelectedTab();
          }
        });
    } else {
      this.cpStandings = [];
      this.knockoutFixtures = [];
      this.leagueData = [];
    }
  }

  updateSelectedTab() {
    if (this.cpStandings.length) {
      this.activeIndex = 0;
    } else if (this.knockoutFixtures.length) {
      this.activeIndex = 1;
    } else if (this.leagueData.length) {
      this.activeIndex = 2;
    }
  }

  getSeasonID(): Observable<string> {
    return this.ngFire.collection('seasons', (query) => query.where('name', '==', this.seasonChosen)).get().pipe(map((res) => !res.empty ? res.docs[0].id : null));
  }

  getMatchesByType(matchType: TournamentTypes): Observable<any> {
    return this.ngFire.collection('allMatches', (query) => query.where('season', '==', this.seasonChosen).where('type', '==', matchType)).get().pipe(map((res) => !res.empty ? res.docs.map(doc => doc.data() as MatchFixture[]) : []));
  }
}

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchConstantsSecondary } from 'projects/admin/src/app/shared/constants/constants';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import {
  CommunityLeaderboard,
  FilterData,
  LeagueTableModel,
} from 'src/app/shared/interfaces/others.model';
import { SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';

@Component({
  selector: 'app-pl-standings',
  templateUrl: './pl-standings.component.html',
  styleUrls: ['./pl-standings.component.css'],
})
export class PlStandingsComponent implements OnInit, OnDestroy {
  onMobile = false;
  subscriptions = new Subscription();
  knockoutFixtures: MatchFixture[] = [];
  seasonChosen = null;
  isNoSeasonKnockout = true;
  isNoSeasonLeague = true;
  filterData: FilterData = {
    defaultFilterPath: '',
    filtersObj: {},
  };
  tableData: LeagueTableModel[] = [];
  cpStandings: CommunityLeaderboard[] = [];
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;
  constructor(
    private ngFire: AngularFirestore,
    private route: ActivatedRoute,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.subscriptions.add(
      this.route.queryParams.subscribe((params) => {
        if (params && params.s) {
          this.onChooseSeason(params.s);
        }
      })
    );
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
      this.router.navigate(['/play', 'standings'], { queryParams: { s: queryInfo.queryValue } });
    } else {
      this.seasonChosen = null;
    }
  }

  onChooseSeason(seasonName: string): void {
    this.seasonChosen = seasonName;
    this.ngFire
      .collection('allMatches', (query) =>
        query.where('season', '==', seasonName).where('type', '==', 'FKC')
      )
      .get()
      .pipe(map((resp) => resp.docs.map((doc) => doc.data()) as MatchFixture[]))
      .subscribe((res) => {
        this.knockoutFixtures = res;
        this.tabGroup.selectedIndex = this.knockoutFixtures.length ? 0 : 1;
      });
    this.ngFire
      .collection('allMatches', (query) => query.where('season', '==', seasonName).where('type', '==', 'FCP'))
      .get()
      .pipe(
        map((resp) => resp.docs.map((doc) => doc.data()) as MatchFixture[]),
        map(docs => docs.map(doc => {
          const homeDetails = {
            name: doc.home.name || MatchConstantsSecondary.TO_BE_DECIDED,
            logo: doc.home.logo || MatchConstantsSecondary.DEFAULT_LOGO,
            score: doc.home.score || null
          }
          const awayDetails = {
            name: doc.away.name || MatchConstantsSecondary.TO_BE_DECIDED,
            logo: doc.away.logo || MatchConstantsSecondary.DEFAULT_LOGO,
            score: doc.away.score || null
          }
          let winner = MatchConstantsSecondary.TO_BE_DECIDED;
          if (homeDetails.score !== awayDetails.score) {
            winner = homeDetails.score > awayDetails.score ? homeDetails.name : awayDetails.name;
          }
          return {
            home: {
              'timgpath': homeDetails.logo,
              'tName': homeDetails.name
            },
            away: {
              'timgpath': awayDetails.logo,
              'tName': awayDetails.name
            },
            stadium: doc.stadium,
            winner
          } as CommunityLeaderboard
        }))
      )
      .subscribe((res: CommunityLeaderboard[]) => {
        this.cpStandings = res;
        if (this.knockoutFixtures.length) {
          this.tabGroup.selectedIndex = 0;
        } else if (this.tableData.length) {
          this.tabGroup.selectedIndex = 1;
        } else {
          this.tabGroup.selectedIndex = 2;
        }
      });
    this.ngFire
      .collection('seasons', (query) => query.where('name', '==', seasonName))
      .get()
      .pipe(
        map((res) => {
          if (!res.empty) {
            return res.docs[0].id;
          }
          return null;
        })
      )
      .subscribe((res) => {
        if (res) {
          this.ngFire
            .collection('leagues')
            .doc(res)
            .get()
            .subscribe((response) => {
              this.tableData = [];
              if (response.exists) {
                this.tableData = Object.values(
                  response.data()
                ) as LeagueTableModel[];
              }
            });
        }
      });
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import {
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
  constructor(
    private ngFire: AngularFirestore,
    private route: ActivatedRoute
  ) {}
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
      this.onChooseSeason(queryInfo.queryValue);
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
      });
    this.ngFire
      .collection('seasons', (query) => query.where('name', '==', seasonName))
      .get()
      .pipe(
        map((res) => {
          if (!res.empty) return res.docs[0].id;
          else return null;
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

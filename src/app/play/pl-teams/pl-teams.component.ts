import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { SocialShareService } from 'src/app/services/social-share.service';
import {
  FilterHeadingMap,
  FilterSymbolMap,
  FilterValueMap,
  TeamsFilters,
} from 'src/app/shared/Constants/FILTERS';
import { LOREM_IPSUM_SHORT } from 'src/app/shared/Constants/LOREM_IPSUM';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import {
  FilterData,
  QueryInfo,
  ShareData,
} from 'src/app/shared/interfaces/others.model';
import { TeamBasicInfo } from 'src/app/shared/interfaces/team.model';
import { PlayerBasicInfo } from 'src/app/shared/interfaces/user.model';

@Component({
  selector: 'app-pl-teams',
  templateUrl: './pl-teams.component.html',
  styleUrls: ['./pl-teams.component.css'],
})
export class PlTeamsComponent implements OnInit {
  filterTerm: string = null;
  isLoading: boolean = true;
  noTeams: boolean = false;
  onMobile: boolean = false;
  teams$: Observable<TeamBasicInfo[]>;
  filterData: FilterData;
  cols: number = 1;
  watcher: Subscription;
  constructor(
    private ngFire: AngularFirestore,
    private mediaObs: MediaObserver,
    private dialog: MatDialog,
    private shareServ: SocialShareService
  ) {
    this.filterData = {
      defaultFilterPath: 'teams',
      filtersObj: TeamsFilters,
    };
    this.watcher = mediaObs
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
          this.onMobile = true;
        } else if (change.mqAlias === 'md') {
          this.onMobile = false;
          this.cols = 3;
        } else {
          this.onMobile = false;
          this.cols = 4;
        }
      });
  }

  ngOnInit(): void {
    this.getTeams();
  }

  getTeams() {
    this.teams$ = this.ngFire
      .collection('teams', (ref) => ref.orderBy('tname'))
      .get()
      .pipe(
        tap((val) => {
          this.noTeams = val.empty;
          this.isLoading = false;
          console.log('here');
        }),
        map((resp) =>
          resp.docs.map(
            (doc) =>
              <TeamBasicInfo>{ id: doc.id, ...(<TeamBasicInfo>doc.data()) }
          )
        )
      );
  }
  onQueryData(queryInfo: QueryInfo): void {
    if (queryInfo === null) {
      return this.getTeams();
    }
    queryInfo = {
      queryItem: FilterHeadingMap[queryInfo.queryItem],
      queryComparisonSymbol: FilterSymbolMap[queryInfo.queryItem]
        ? FilterSymbolMap[queryInfo.queryItem]
        : '==',
      queryValue: FilterValueMap[queryInfo.queryValue],
    };

    this.teams$ = this.ngFire
      .collection('teams', (query) =>
        query.where(
          queryInfo.queryItem,
          queryInfo.queryComparisonSymbol,
          queryInfo.queryValue
        )
      )
      .get()
      .pipe(
        // tap((resp) => {
        //   console.log(resp);
        //   this.noSeasons = resp.empty;
        //   this.isLoading = false;
        // }),
        map((resp) => resp.docs.map((doc) => doc.data() as TeamBasicInfo))
      );
  }
  // onShare(team: TeamBasicInfo) {
  //   const ShareData: ShareData = {
  //     share_title: team.tname,
  //     share_desc: LOREM_IPSUM_SHORT,
  //     share_url: 'https://freekyk8--h-qcd2k7n4.web.app/' + 's/' + team.tname,
  //     share_imgpath: team.imgpath,
  //   };
  //   this.shareServ.onShare(ShareData);
  // }
}

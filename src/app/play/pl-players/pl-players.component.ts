import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AngularFirestore,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import { merge, Observable, Subscription } from 'rxjs';
import {
  filter,
  map,
  mergeMap,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import {
  FilterHeadingMap,
  FilterSymbolMap,
  FilterValueMap,
  PlayersFilters,
} from 'src/app/shared/Constants/FILTERS';
import { PlayerCardComponent } from 'src/app/shared/dialogs/player-card/player-card.component';
import { FilterData, QueryInfo } from 'src/app/shared/interfaces/others.model';
import { SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';
import { PlayerBasicInfo } from 'src/app/shared/interfaces/user.model';

@Component({
  selector: 'app-pl-players',
  templateUrl: './pl-players.component.html',
  styleUrls: ['./pl-players.component.css'],
})
export class PlPlayersComponent implements OnInit, OnDestroy {
  filterTerm: string = null;
  selectedRowIndex;
  onMobile: boolean = false;
  players$: Observable<PlayerBasicInfo[]>;
  totLength: number = 0;
  pageSize: number = 10;
  filterData: FilterData;
  cols = ['jersey', 'player', 'Team', 'Location', 'PlayingPos'];
  lastDoc: QueryDocumentSnapshot<PlayerBasicInfo> = null;
  watcher: Subscription;
  constructor(
    private ngFire: AngularFirestore,
    private mediaObs: MediaObserver,
    private dialog: MatDialog
  ) {
    this.watcher = this.mediaObs
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        if (change.mqAlias === 'sm' || change.mqAlias === 'xs')
          this.onMobile = true;
        else this.onMobile = false;
      });
    this.filterData = {
      defaultFilterPath: 'players',
      filtersObj: PlayersFilters,
    };
  }
  onQueryData(queryInfo: QueryInfo): void {
    queryInfo = {
      queryItem: FilterHeadingMap[queryInfo.queryItem],
      queryComparisonSymbol: FilterSymbolMap[queryInfo.queryItem]
        ? FilterSymbolMap[queryInfo.queryItem]
        : '==',
      queryValue: FilterValueMap[queryInfo.queryValue],
    };

    this.players$ = this.ngFire
      .collection('players', (query) =>
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
        map((resp) => resp.docs.map((doc) => doc.data() as PlayerBasicInfo))
      );
  }
  // ngAfterViewInit() {

  //   if (!this.onMobile) {
  //     this.players$ = merge(this.paginator.page).pipe(
  //       startWith({}),
  //       mergeMap(() => {
  //         return this.ngFire
  //           .collection('players')
  //           .get()
  //           .pipe(
  //             mergeMap((resp) => {
  //               this.totLength = resp.size;
  //               if (this.lastDoc == null)
  //                 this.lastDoc = <DocumentSnapshot<PlayerBasicInfo>>(
  //                   resp.docs[0]
  //                 );
  //               return this.ngFire
  //                 .collection('players', (query) => {
  //                   if(page.)
  //                   return this.lastDoc == null
  //                     ? query.limit(this.pageSize)
  //                     : query.limit(this.pageSize).startAfter(this.lastDoc);
  //                 })
  //                 .get()
  //                 .pipe(
  //                   tap(
  //                     (resp) =>
  //                       (this.lastDoc = <DocumentSnapshot<PlayerBasicInfo>>(
  //                         resp.docs[resp.docs.length - 1]
  //                       ))
  //                   ),
  //                   map((resp) =>
  //                     resp.docs.map(
  //                       (doc) =>
  //                         <PlayerBasicInfo>{
  //                           id: doc.id,
  //                           ...(<PlayerBasicInfo>doc.data()),
  //                         }
  //                     )
  //                   )
  //                 );
  //             })
  //           );
  //       })
  //     );
  //   }
  // }
  ngOnInit(): void {
    // this.players$ = this.ngFire
    //   .collection('players')
    //   .get()
    //   .pipe(
    //     switchMap((resp) => {
    //       this.totLength = resp.size;
    //       this.lastDoc = <QueryDocumentSnapshot<PlayerBasicInfo>>(
    //         resp.docs[resp.size - 1]
    //       );
    //       return this.ngFire
    //         .collection('players', (query) => query.limit(this.pageSize))
    //         .get()
    //         .pipe(
    //           map((resp) =>
    //             resp.docs.map(
    //               (doc) =>
    //                 <PlayerBasicInfo>{
    //                   id: doc.id,
    //                   ...(<PlayerBasicInfo>doc.data()),
    //                 }
    //             )
    //           )
    //         );
    //     })
    //   );
    this.players$ = this.ngFire
      .collection('players')
      .get()
      .pipe(
        map((resp) =>
          resp.docs.map(
            (doc) =>
              <PlayerBasicInfo>{
                id: doc.id,
                ...(<PlayerBasicInfo>doc.data()),
              }
          )
        )
      );
  }
  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
  getPlayers(doc?: DocumentSnapshot<PlayerBasicInfo>) {
    // this.players$ =
  }
  onOpenPlayerProfile(player: PlayerBasicInfo) {
    this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: player,
    });
  }
  // onChangePage(page: PageEvent) {
  //   this.players$ = this.ngFire
  //     .collection('players', (query) => {
  //       if (page.pageIndex > page.previousPageIndex) {
  //         return query.limit(this.pageSize).startAfter(this.lastDoc);
  //       } else {
  //         return query.limit(this.pageSize).endAt(this.lastDoc);
  //       }
  //     })
  //     .get()
  //     .pipe(
  //       tap((resp) => {
  //         this.lastDoc = <QueryDocumentSnapshot<PlayerBasicInfo>>(
  //           resp.docs[resp.size - 1]
  //         );
  //       }),
  //       map((resp) =>
  //         resp.docs.map(
  //           (doc) =>
  //             <PlayerBasicInfo>{ id: doc.id, ...(<PlayerBasicInfo>doc.data()) }
  //         )
  //       )
  //     );
  // }
}

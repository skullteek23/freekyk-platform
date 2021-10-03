import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AngularFirestore,
  QueryDocumentSnapshot,
} from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { PlayersFilters } from 'src/app/shared/Constants/FILTERS';
import { PlayerCardComponent } from 'src/app/shared/dialogs/player-card/player-card.component';
import { FilterData } from 'src/app/shared/interfaces/others.model';
import { PlayerBasicInfo } from 'src/app/shared/interfaces/user.model';

@Component({
  selector: 'app-pl-players',
  templateUrl: './pl-players.component.html',
  styleUrls: ['./pl-players.component.css'],
})
export class PlPlayersComponent implements OnInit, OnDestroy {
  filterTerm: string = null;
  selectedRowIndex;
  onMobile = false;
  players$: Observable<PlayerBasicInfo[]>;
  filterData: FilterData;
  cols = ['jersey', 'player', 'Team', 'Location', 'PlayingPos'];
  lastDoc: QueryDocumentSnapshot<PlayerBasicInfo> = null;
  subscriptions = new Subscription();
  constructor(
    private ngFire: AngularFirestore,
    private mediaObs: MediaObserver,
    private dialog: MatDialog,
    private queryServ: QueryService
  ) {}
  ngOnInit(): void {
    this.subscriptions.add(
      this.mediaObs
        .asObservable()
        .pipe(
          filter((changes: MediaChange[]) => changes.length > 0),
          map((changes: MediaChange[]) => changes[0])
        )
        .subscribe((change: MediaChange) => {
          if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
            this.onMobile = true;
          } else {
            this.onMobile = false;
          }
        })
    );
    this.filterData = {
      defaultFilterPath: 'players',
      filtersObj: PlayersFilters,
    };
    this.getPlayers();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  getPlayers(): void {
    this.players$ = this.ngFire
      .collection('players')
      .get()
      .pipe(
        map((resp) =>
          resp.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...(doc.data() as PlayerBasicInfo),
              } as PlayerBasicInfo)
          )
        )
      );
  }
  onQueryData(queryInfo): void {
    if (queryInfo == null) {
      return this.getPlayers();
    }
    this.players$ = this.queryServ
      .onQueryData(queryInfo, 'players')
      .pipe(
        map((resp) => resp.docs.map((doc) => doc.data() as PlayerBasicInfo))
      );
  }
  onOpenPlayerProfile(player: PlayerBasicInfo): void {
    this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: player,
    });
  }
}

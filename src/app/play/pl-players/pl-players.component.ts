import { Component, OnDestroy, OnInit } from '@angular/core';
import { QueryDocumentSnapshot } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { PlayersFilters } from '@shared/Constants/FILTERS';
import { PlayerCardComponent } from '@shared/dialogs/player-card/player-card.component';
import { FilterData } from '@shared/interfaces/others.model';
import { PlayerBasicInfo } from '@shared/interfaces/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '@shared/services/api.service';
import { manipulatePlayerData } from '@shared/utils/pipe-functions';

@Component({
  selector: 'app-pl-players',
  templateUrl: './pl-players.component.html',
  styleUrls: ['./pl-players.component.scss'],
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
    private mediaObs: MediaObserver,
    private dialog: MatDialog,
    private queryService: QueryService,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.route.params.subscribe(params => {
      if (params?.hasOwnProperty('uid')) {
        this.openPlayerCard(params['uid']);
      }
    }));
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
    this.players$ = this.apiService.getPlayers();
  }

  onQueryData(queryInfo): void {
    if (queryInfo == null) {
      return this.getPlayers();
    }
    this.players$ = this.queryService
      .onQueryData(queryInfo, 'players')
      .pipe(manipulatePlayerData.bind(this));
  }

  selectRow(player: PlayerBasicInfo) {
    this.router.navigate(['/play/players', player.id]);
  }

  openPlayerCard(playerID: string) {
    this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: playerID,
    }).afterClosed().subscribe(() => this.router.navigate(['/play/players']));
  }

}

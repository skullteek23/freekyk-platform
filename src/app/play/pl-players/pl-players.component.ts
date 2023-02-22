import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { PlayerCardComponent } from '@shared/dialogs/player-card/player-card.component';
import { PlayerBasicInfo } from '@shared/interfaces/user.model';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '@shared/services/api.service';

@Component({
  selector: 'app-pl-players',
  templateUrl: './pl-players.component.html',
  styleUrls: ['./pl-players.component.scss'],
})
export class PlPlayersComponent implements OnInit, OnDestroy {

  players: PlayerBasicInfo[] = [];
  subscriptions = new Subscription();

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private location: Location,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.route.params.subscribe(params => {
      if (params?.hasOwnProperty('uid')) {
        this.openPlayerCard(params['uid']);
      }
    }));

    this.getPlayers();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getPlayers(): void {
    this.apiService.getPlayers()
      .subscribe({
        next: (response) => {
          if (response) {
            this.players = response;
            window.scrollTo(0, 0);
          }
        },
        error: (response) => {
          this.players = [];
          window.scrollTo(0, 0);
        },
      });
  }

  openPlayerCard(playerID: string) {
    this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: playerID,
    }).afterClosed().subscribe(() => this.location.go('/play/players'));
  }

}

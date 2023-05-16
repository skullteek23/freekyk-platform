import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { PlayerCardComponent } from '@shared/dialogs/player-card/player-card.component';
import { IPlayer } from '@shared/interfaces/user.model';
import { ApiGetService } from '@shared/services/api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-find-players',
  templateUrl: './find-players.component.html',
  styleUrls: ['./find-players.component.scss']
})
export class FindPlayersComponent implements OnInit {

  playersList: IPlayer[] = [];
  playersListCache: IPlayer[] = [];
  isLoaderShown = false;
  subscriptions = new Subscription();

  constructor(
    private apiService: ApiGetService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.route.params.subscribe(params => {
      if (params?.hasOwnProperty('playerid')) {
        this.openProfile(params['playerid']);
      }
    }));
    this.getPlayers();
  }

  getPlayers() {
    this.isLoaderShown = true;
    this.apiService.getPlayers()
      .subscribe({
        next: (response) => {
          if (response) {
            this.playersList = response;
            this.playersListCache = JSON.parse(JSON.stringify(response));
          }
          this.isLoaderShown = false;
          window.scrollTo(0, 0)
        },
        error: () => {
          this.playersList = [];
          this.playersListCache = [];
          this.isLoaderShown = false;
          window.scrollTo(0, 0)
        }
      })
  }

  openProfile(playerID: string) {
    this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: playerID,
    });
  }

  applySearch(searchValue: string) {
    if (searchValue) {
      this.playersList = this.playersListCache.filter(el => el.name.toLowerCase().includes(searchValue.toLowerCase()));
    } else {
      this.playersList = JSON.parse(JSON.stringify(this.playersListCache));
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlayerCardComponent } from '@shared/dialogs/player-card/player-card.component';
import { IPlayer } from '@shared/interfaces/user.model';
import { ApiGetService } from '@shared/services/api.service';

@Component({
  selector: 'app-find-players',
  templateUrl: './find-players.component.html',
  styleUrls: ['./find-players.component.scss']
})
export class FindPlayersComponent implements OnInit {

  playersList: IPlayer[] = [];
  isLoaderShown = false;

  constructor(
    private apiService: ApiGetService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getPlayers();
  }

  getPlayers() {
    this.isLoaderShown = true;
    this.apiService.getPlayers()
      .subscribe({
        next: (response) => {
          if (response) {
            this.playersList = response;
          }
          this.isLoaderShown = false;
          window.scrollTo(0, 0)
        },
        error: () => {
          this.playersList = [];
          this.isLoaderShown = false;
          window.scrollTo(0, 0)
        }
      })
  }

  openProfile(player: IPlayer) {
    this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: player.id,
    });
  }

}

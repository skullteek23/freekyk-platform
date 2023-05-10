import { Component, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ISeason } from '@shared/interfaces/season.model';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  @Input() game: ISeason = null;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  joinGame() {
    if (this.game.id) {
      if (this.game.type === 'FCP') {
        this.router.navigate(['/pickup-game', this.game.id])
      } else {
        this.router.navigate(['/game', this.game.id])
      }
    }
  }

  get participantType() {
    if (this.game?.type === 'FCP') {
      return 'per Player'
    } else {
      return 'per Team'
    }
  }
}

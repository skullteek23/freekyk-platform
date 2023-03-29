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
      this.router.navigate(['/game', this.game.id])
    }
  }
}
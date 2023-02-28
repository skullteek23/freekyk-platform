import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatchConstants } from '@shared/constants/constants';
import { MatchCardComponent } from '@shared/dialogs/match-card/match-card.component';
import { MatchFixture } from '@shared/interfaces/match.model';

export interface IKnockoutData {
  match: MatchFixture,
  next?: IKnockoutData[]
}

@Component({
  selector: 'app-knockout-bracket',
  templateUrl: './knockout-bracket.component.html',
  styleUrls: ['./knockout-bracket.component.scss']
})
export class KnockoutBracketComponent implements OnInit {

  readonly TO_BE_DECIDED = MatchConstants.TO_BE_DECIDED;
  @Input() data: IKnockoutData;

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  openMatch(matchID: string) {
    this.dialog.open(MatchCardComponent, {
      panelClass: 'fk-dialogs',
      data: matchID,
    });
  }

  get isMatchScored(): boolean {
    return this.data?.match?.home.hasOwnProperty('score');
  }

  get isTBD(): boolean {
    return this.data?.match?.home.name === this.TO_BE_DECIDED
  }

  get isTBDAway(): boolean {
    return this.data?.match?.away.name === this.TO_BE_DECIDED
  }

}

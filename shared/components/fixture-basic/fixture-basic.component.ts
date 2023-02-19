import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatchCardComponent } from '../../dialogs/match-card/match-card.component';
import { Formatters, MatchFixture, MatchStatus, ParseMatchProperties, StatusMessage, } from '../../interfaces/match.model';

@Component({
  selector: 'app-fixture-basic',
  templateUrl: './fixture-basic.component.html',
  styleUrls: ['./fixture-basic.component.scss'],
})
export class FixtureBasicComponent {

  readonly matchStatus = MatchStatus;

  @Input('matchData') set matchData(value: MatchFixture) {
    if (value) {
      this.fixture = value;
      this.isResult = ParseMatchProperties.isResult(value.date);
    }
  }

  fixture: MatchFixture;
  isResult = false;
  formatters: any;

  constructor(
    private dialog: MatDialog
  ) {
    this.formatters = Formatters;
  }

  openFixture() {
    this.dialog.open(MatchCardComponent, {
      panelClass: 'fk-dialogs',
      data: this.fixture.id,
    });
  }

  get scoreStr(): string {
    if (this.fixture.home.hasOwnProperty('score') && this.fixture.away.hasOwnProperty('score')) {
      return `${this.fixture.home.score} - ${this.fixture.away.score}`
    }
    return `-`
  }
}

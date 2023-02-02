import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatchCardComponent } from '../../dialogs/match-card/match-card.component';
import { Formatters, MatchFixture, MatchStatus, StatusMessage, } from '../../interfaces/match.model';

@Component({
  selector: 'app-fixture-basic',
  templateUrl: './fixture-basic.component.html',
  styleUrls: ['./fixture-basic.component.scss'],
})
export class FixtureBasicComponent implements OnInit {

  readonly matchStatus = MatchStatus;

  @Input('matchData') fixture: MatchFixture;
  @Input('premium') isPremium = false;
  @Input('resultMode') isResult = false;

  todaysDate = new Date();
  formatters: any

  constructor(
    private dialog: MatDialog
  ) {
    this.formatters = Formatters;
  }

  ngOnInit(): void { }

  onOpenFixture() {
    this.dialog.open(MatchCardComponent, {
      panelClass: 'fk-dialogs',
      data: this.fixture.id,
    });
  }
}

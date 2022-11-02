import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatchCardComponent } from '../../dialogs/match-card/match-card.component';
import { MatchFixture, } from '../../interfaces/match.model';

@Component({
  selector: 'app-fixture-basic',
  templateUrl: './fixture-basic.component.html',
  styleUrls: ['./fixture-basic.component.scss'],
})
export class FixtureBasicComponent implements OnInit {
  @Input('matchData') fixture: MatchFixture;
  @Input('premium') isPremium = false;
  @Input('resultMode') isResult = false;
  todaysDate = new Date();
  constructor(private dialog: MatDialog) { }
  ngOnInit(): void { }
  onOpenFixture() {
    this.dialog.open(MatchCardComponent, {
      panelClass: 'fk-dialogs',
      data: this.fixture,
    });
  }
}

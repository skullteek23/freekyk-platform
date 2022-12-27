import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatchCardComponent } from '@shared/dialogs/match-card/match-card.component';
import { MatchFixture } from '@shared/interfaces/match.model';

@Component({
  selector: 'app-fixture-dashboard',
  templateUrl: './fixture-dashboard.component.html',
  styleUrls: ['./fixture-dashboard.component.scss'],
})
export class FixtureDashboardComponent implements OnInit {

  @Input('matchData') fixture: MatchFixture | null = null;
  @Input('premium') isPremium = false;
  @Input('resultMode') isResult = false;
  @Input('addSticker') myTeam: string = null;

  todaysDate = new Date();

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit(): void { }

  onOpenFixture(): void {
    const dialogRef = this.dialog.open(MatchCardComponent, {
      panelClass: 'fk-dialogs',
      data: this.fixture,
    });
  }
}

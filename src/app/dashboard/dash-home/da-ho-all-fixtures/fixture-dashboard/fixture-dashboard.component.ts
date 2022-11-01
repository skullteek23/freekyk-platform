import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatchCardComponent } from 'src/app/shared/dialogs/match-card/match-card.component';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';

@Component({
  selector: 'app-fixture-dashboard',
  templateUrl: './fixture-dashboard.component.html',
  styleUrls: ['./fixture-dashboard.component.css'],
})
export class FixtureDashboardComponent implements OnInit {
  @Input('matchData') fixture: MatchFixture | null = null;
  @Input('premium') isPremium = false;
  @Input('resultMode') isResult = false;
  @Input('addSticker') myTeam: string = null;
  todaysDate = new Date();
  constructor(private dialog: MatDialog) { }
  ngOnInit(): void { }
  onOpenFixture(): void {
    const dialogRef = this.dialog.open(MatchCardComponent, {
      panelClass: 'fk-dialogs',
      data: this.fixture,
    });
  }
}

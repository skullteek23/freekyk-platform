import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatchCardComponent } from '@shared/dialogs/match-card/match-card.component';
import { Formatters, MatchFixture, MatchStatus } from '@shared/interfaces/match.model';

@Component({
  selector: 'app-upcoming-match',
  templateUrl: './upcoming-match.component.html',
  styleUrls: ['./upcoming-match.component.scss']
})
export class UpcomingMatchComponent {

  readonly formatters = Formatters;
  readonly MatchStatus = MatchStatus;

  @Input() fixture: MatchFixture;
  @Input() description: string = '';

  constructor(
    private dialog: MatDialog
  ) { }

  onOpenFixture(): void {
    if (this.fixture) {
      const dialogRef = this.dialog.open(MatchCardComponent, {
        panelClass: 'fk-dialogs',
        data: this.fixture.id,
      });
    }
  }
}

import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatchCardComponent } from 'src/app/shared/dialogs/match-card/match-card.component';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';

@Component({
  selector: 'app-current-match',
  templateUrl: './current-match.component.html',
  styleUrls: ['./current-match.component.css'],
})
export class CurrentMatchComponent {
  @Input() data: MatchFixture;
  constructor(private dialog: MatDialog) {}
  onOpenFixture(): void {
    const dialogRef = this.dialog.open(MatchCardComponent, {
      panelClass: 'fk-dialogs',
      data: this.data,
    });
  }
}

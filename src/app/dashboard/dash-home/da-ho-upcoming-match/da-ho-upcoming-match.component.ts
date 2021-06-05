import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { MatchCardComponent } from 'src/app/shared/dialogs/match-card/match-card.component';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import * as fromApp from '../../../store/app.reducer';

@Component({
  selector: 'app-da-ho-upcoming-match',
  templateUrl: './da-ho-upcoming-match.component.html',
  styleUrls: ['./da-ho-upcoming-match.component.css'],
})
export class DaHoUpcomingMatchComponent implements OnInit {
  noUpcomingMatch: boolean = false;
  upFixture: MatchFixture;
  constructor(
    private dialog: MatDialog,
    private store: Store<fromApp.AppState>
  ) {
    this.store
      .select('team')
      .pipe(map((data) => data.upcomingMatches[1]))
      .subscribe((match) => {
        if (match == undefined) this.noUpcomingMatch = true;
        else {
          this.upFixture = match;
          this.noUpcomingMatch = false;
        }
      });
  }
  ngOnInit(): void {}
  onOpenFixture() {
    const dialogRef = this.dialog.open(MatchCardComponent, {
      panelClass: 'fk-dialogs',
      data: this.upFixture,
    });
  }
}

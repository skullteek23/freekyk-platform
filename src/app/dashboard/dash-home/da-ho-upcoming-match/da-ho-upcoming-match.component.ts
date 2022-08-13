import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatchCardComponent } from 'src/app/shared/dialogs/match-card/match-card.component';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import { TeamState } from '../../dash-team-manag/store/team.reducer';

@Component({
  selector: 'app-da-ho-upcoming-match',
  templateUrl: './da-ho-upcoming-match.component.html',
  styleUrls: ['./da-ho-upcoming-match.component.css'],
})
export class DaHoUpcomingMatchComponent implements OnInit, OnDestroy {
  noUpcomingMatch = false;
  upFixture: MatchFixture;
  subscriptions = new Subscription();
  constructor(
    private dialog: MatDialog,
    private store: Store<{
      team: TeamState;
    }>
  ) { }
  ngOnInit(): void {
    this.subscriptions.add(
      this.store
        .select('team')
        .pipe(map((resp) => resp.upcomingMatches))
        .subscribe((match: MatchFixture[]) => {
          // console.log(match);
          this.upFixture = match && match.length !== 0 ? match[0] : undefined;
          this.noUpcomingMatch = match && match.length === 0;
        })
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  onOpenFixture(): void {
    const dialogRef = this.dialog.open(MatchCardComponent, {
      panelClass: 'fk-dialogs',
      data: this.upFixture,
    });
  }
}

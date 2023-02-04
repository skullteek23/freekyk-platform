import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatchCardComponent } from '@shared/dialogs/match-card/match-card.component';
import { Formatters, MatchFixture, MatchStatus, ParseMatchProperties } from '@shared/interfaces/match.model';
import { TeamState } from '../../dash-team-manag/store/team.reducer';

@Component({
  selector: 'app-da-ho-upcoming-match',
  templateUrl: './da-ho-upcoming-match.component.html',
  styleUrls: ['./da-ho-upcoming-match.component.scss'],
})
export class DaHoUpcomingMatchComponent implements OnInit, OnDestroy {

  readonly formatters = Formatters;
  readonly MatchStatus = MatchStatus;

  matchData: MatchFixture;
  matchDesc: string = '';
  subscriptions = new Subscription();

  constructor(
    private dialog: MatDialog,
    private store: Store<{ team: TeamState; }>
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.store
        .select('team')
        .pipe(map((resp) => resp.upcomingMatches))
        .subscribe((data: MatchFixture[]) => {
          if (data?.length) {
            const matchCopy = JSON.parse(JSON.stringify(data[0]));
            this.matchData = JSON.parse(JSON.stringify(matchCopy));
            this.matchData.status = ParseMatchProperties.getTimeDrivenStatus(matchCopy.status, matchCopy.date);
            this.matchDesc = ParseMatchProperties.getStatusDescription(this.matchData.status);
          } else {
            this.matchData = null;
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onOpenFixture(): void {
    if (this.matchData) {
      const dialogRef = this.dialog.open(MatchCardComponent, {
        panelClass: 'fk-dialogs',
        data: this.matchData.id,
      });
    }
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { matchData } from '../../interfaces/others.model';

@Component({
  selector: 'app-match-detail-header',
  templateUrl: './match-detail-header.component.html',
  styleUrls: ['./match-detail-header.component.css'],
})
export class MatchDetailHeaderComponent implements OnInit {
  isFixture: boolean = true;
  @Input('data') matchData: matchData = null;
  constructor() {}
  ngOnInit(): void {
    this.isFixture = !this.matchData.concluded;
  }
  getWinningTeam() {
    if (!this.isFixture) {
      if (this.matchData?.score?.home == this.matchData?.score?.away)
        return 'This match was a draw!';
      return (
        'Team ' +
        (this.matchData?.score?.home > this.matchData?.score?.away
          ? this.matchData.home.name
          : this.matchData.away.name) +
        ' won the match!'
      );
    }
  }
}

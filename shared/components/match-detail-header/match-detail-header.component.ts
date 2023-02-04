import { Component, Input } from '@angular/core';
import { MatchConstants } from '@shared/constants/constants';
import { Formatters, MatchFixture, MatchStatus, ParseMatchProperties } from '@shared/interfaces/match.model';

@Component({
  selector: 'app-match-detail-header',
  templateUrl: './match-detail-header.component.html',
  styleUrls: ['./match-detail-header.component.scss'],
})
export class MatchDetailHeaderComponent {

  readonly formatters = Formatters;
  readonly MatchStatus = MatchStatus;

  matchData: MatchFixture;
  matchDesc: string = '';

  @Input() set data(value: MatchFixture) {
    if (value) {
      this.matchData = value;
      this.matchData.status = ParseMatchProperties.getTimeDrivenStatus(value.status, value.date);
      this.matchDesc = ParseMatchProperties.getStatusDescription(this.matchData.status);
    }
  }


  // getResultStatus(value: MatchFixture): string {
  //   const penaltyScores: number[] = value?.tie_breaker?.split('-')?.map(el => Number(el));
  //   if (value?.home?.score > value?.away?.score) {
  //     return `Team ${value.home.name} won the match!`;
  //   } else if (value?.home?.score < value?.away?.score) {
  //     return `Team ${value.away.name} won the match!`;
  //   } else if (penaltyScores && penaltyScores[0] >= 0 && penaltyScores[1] >= 0 && (penaltyScores[0] - penaltyScores[1] !== 0)) {
  //     const winner = penaltyScores[0] > penaltyScores[1] ? value.home.name : value.away.name;
  //     return `Team ${winner} won the match by penalties!`;
  //   } else {
  //     return 'This match was a draw!';
  //   }
  // }
}

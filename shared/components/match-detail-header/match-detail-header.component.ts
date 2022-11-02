import { Component, Input } from '@angular/core';
import { matchData } from '../../interfaces/others.model';

@Component({
  selector: 'app-match-detail-header',
  templateUrl: './match-detail-header.component.html',
  styleUrls: ['./match-detail-header.component.scss'],
})
export class MatchDetailHeaderComponent {

  isFixture = true;
  matchData: matchData;
  resultStatus = '';

  @Input() set data(value: matchData) {
    if (value) {
      this.matchData = value;
      this.isFixture = value.concluded === false;
      this.resultStatus = this.getResultStatus(value);
    }
  }

  getResultStatus(value: matchData): string {
    const penaltyScores: number[] = value?.penalties?.split('-')?.map(el => Number(el));
    if (value.score?.home > value.score?.away) {
      return `Team ${value.home.name} won the match!`;
    } else if (value.score?.home < value.score?.away) {
      return `Team ${value.away.name} won the match!`;
    } else if (penaltyScores && penaltyScores[0] >= 0 && penaltyScores[1] >= 0 && (penaltyScores[0] - penaltyScores[1] !== 0)) {
      const winner = penaltyScores[0] > penaltyScores[1] ? value.home.name : value.away.name;
      return `Team ${winner} won the match by penalties!`;
    } else {
      return 'This match was a draw!';
    }
  }
}

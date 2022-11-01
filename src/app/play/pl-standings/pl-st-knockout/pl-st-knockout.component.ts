import { Component, Input } from '@angular/core';
import { MatchFixture } from '@shared/interfaces/match.model';
@Component({
  selector: 'app-pl-st-knockout',
  templateUrl: './pl-st-knockout.component.html',
  styleUrls: ['./pl-st-knockout.component.css'],
})
export class PlStKnockoutComponent {

  roundOfTwoMatches: MatchFixture[] = [];
  roundOfFourMatches: MatchFixture[] = [];
  roundOfEightMatches: MatchFixture[] = [];
  roundOfSixteenMatches: MatchFixture[] = [];
  showEmptyTable = true;

  @Input() set fixtures(values: MatchFixture[]) {
    this.showEmptyTable = values.length === 0;
    values.forEach(element => {
      if (element.fkcRound) {
        if (element.fkcRound === 2) {
          this.roundOfTwoMatches.push(element);
        } else if (element.fkcRound === 4) {
          this.roundOfFourMatches.push(element);
        } else if (element.fkcRound === 8) {
          this.roundOfEightMatches.push(element);
        } else if (element.fkcRound === 16) {
          this.roundOfSixteenMatches.push(element);
        }
      } else {
        this.showEmptyTable = true;
      }
    });
  }
  @Input() season = 'Select a Season';

}

import { Component, Input, OnInit } from '@angular/core';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
@Component({
  selector: 'app-pl-st-knockout',
  templateUrl: './pl-st-knockout.component.html',
  styleUrls: ['./pl-st-knockout.component.css'],
})
export class PlStKnockoutComponent implements OnInit {
  @Input() set fixtures(values: MatchFixture[]) {
    this.showEmptyTable = values.length === 0;
    this.r16Matches = values.filter((val) => val.fkc_status === 'R16');
    this.r8Matches = values.filter((val) => val.fkc_status === 'R8');
    this.qFMatches = values.filter((val) => val.fkc_status === 'R4');
    this.finalMatch = values.find((val) => val.fkc_status === 'F');
  }
  @Input() season = 'Select a Season';
  showEmptyTable = true;
  r16Matches: MatchFixture[];
  r8Matches: MatchFixture[];
  qFMatches: MatchFixture[];
  finalMatch: MatchFixture;
  constructor() {}
  ngOnInit(): void {}
}

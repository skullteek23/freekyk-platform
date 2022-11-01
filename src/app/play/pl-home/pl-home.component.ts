import { Component, OnInit } from '@angular/core';
import { PLAY_PAGE } from '@shared/Constants/WEBSITE_CONTENT';

@Component({
  selector: 'app-pl-home',
  templateUrl: './pl-home.component.html',
  styleUrls: ['./pl-home.component.css'],
})
export class PlHomeComponent implements OnInit {
  readonly findTeamContent = PLAY_PAGE.findTeam;
  readonly seasonsContent = PLAY_PAGE.season;
  readonly fkcContent = PLAY_PAGE.fkc;
  readonly fcpContent = PLAY_PAGE.fcp;
  readonly fplContent = PLAY_PAGE.fpl;
  readonly customizeContent = PLAY_PAGE.customize;
  readonly whyChooseContent = PLAY_PAGE.whyChoosePlay;
  readonly communityNumbers = PLAY_PAGE.communityNumbers;

  constructor() { }
  ngOnInit(): void { }
}

import { Component, OnInit } from '@angular/core';
import { PLAY_PAGE } from 'src/app/shared/Constants/WEBSITE_CONTENT';

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

  constructor() {}
  ngOnInit(): void {}
  communityNumbers = [
    { name: 'Players', number: '400+' },
    { name: 'Tournaments', number: '5+' },
    { name: 'Teams', number: '20+' },
    { name: 'Matches', number: '150+' },
  ];
}

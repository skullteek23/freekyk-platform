import { Component, OnInit } from '@angular/core';
import { FREESTYLE_PAGE } from 'src/app/shared/Constants/WEBSITE_CONTENT';

@Component({
  selector: 'app-fs-home',
  templateUrl: './fs-home.component.html',
  styleUrls: ['./fs-home.component.css'],
})
export class FsHomeComponent implements OnInit {
  readonly journey = FREESTYLE_PAGE.journey;
  readonly leaderboard = FREESTYLE_PAGE.leaderboard;
  readonly contests = FREESTYLE_PAGE.contests;
  readonly whyChooseContent = FREESTYLE_PAGE.whyChooseFreestyle;
  readonly communityNumbers = FREESTYLE_PAGE.communityNumbers;
  constructor() {}
  ngOnInit(): void {}
}

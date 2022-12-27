import { Component, OnInit } from '@angular/core';
import { ABOUT_PAGE } from '@shared/Constants/WEBSITE_CONTENT';
import { profile } from '@shared/interfaces/others.model';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  prateek: profile;
  ankit: profile;
  aboutFreekyk: string;
  ourJourney: string;

  constructor() { }

  ngOnInit(): void {
    this.prateek = ABOUT_PAGE.prateek;
    this.ankit = ABOUT_PAGE.ankit;
    this.aboutFreekyk = ABOUT_PAGE.about_us;
    this.ourJourney = ABOUT_PAGE.journey;
  }
}

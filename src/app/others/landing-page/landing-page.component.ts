import { Component, OnInit } from '@angular/core';
import { LANDING_PAGE } from 'src/app/shared/Constants/WEBSITE_CONTENT';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent implements OnInit {
  readonly descMain = LANDING_PAGE.banner;
  readonly descFkPlay = LANDING_PAGE.freekykPlay;
  readonly descFkFreestyle = LANDING_PAGE.freekykFreestyle;
  readonly descFkAcademies = LANDING_PAGE.freekykAcademies;
  readonly descFkEquipment = LANDING_PAGE.freekykEquipment;
  readonly whyChoose = LANDING_PAGE.whyChooseFreekyk;
  readonly communityNumbersContent = LANDING_PAGE.communityNumbers;
  readonly sliderContent = LANDING_PAGE.communityMedia;
  communityNumbers = [
    { name: 'Players', number: '400+' },
    { name: 'Freestylers', number: '200+' },
    { name: 'Teams', number: '20+' },
    { name: 'Matches', number: '150+' },
  ];
  constructor() {}

  ngOnInit(): void {}
}

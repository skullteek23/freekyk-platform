import { Component, OnInit } from '@angular/core';
import { LANDING_PAGE } from 'src/app/shared/Constants/WEBSITE_CONTENT';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent implements OnInit {
  readonly mainContent = LANDING_PAGE.banner;
  readonly fkPlayContent = LANDING_PAGE.freekykPlay;
  readonly fkFreestyleContent = LANDING_PAGE.freekykFreestyle;
  readonly fkAcademiesContent = LANDING_PAGE.freekykAcademies;
  readonly fkEquipmentContent = LANDING_PAGE.freekykEquipment;
  readonly whyChoose = LANDING_PAGE.whyChooseFreekyk;
  readonly communityNumbersContent = LANDING_PAGE.communityNumbers;
  readonly sliderContent = LANDING_PAGE.communityMedia;
  communityNumbers = [
    { name: 'Players', number: '400+' },
    { name: 'Freestylers', number: '200+' },
    { name: 'Teams', number: '20+' },
    { name: 'Matches', number: '150+' },
  ];
  responsiveSize;
  constructor() {}

  ngOnInit(): void {
    this.responsiveSize = { width: 250, height: 200, space: 12 };
  }
  onResizeSlider(): void {
    if (window.outerWidth > 599) {
      this.responsiveSize = { width: 350, height: 300, space: 16 };
    } else {
      this.responsiveSize = { width: 250, height: 200, space: 12 };
    }
  }
}

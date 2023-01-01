import { Component, OnInit } from '@angular/core';
import { LANDING_PAGE } from '@shared/web-content/WEBSITE_CONTENT';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
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

  responsiveSize;

  constructor(
  ) { }

  ngOnInit(): void {
    this.onResizeSlider();
  }

  onResizeSlider(): void {
    if (this.isMobile) {
      this.responsiveSize = { width: '20%', height: 300, space: 4 };
    } else {
      this.responsiveSize = { width: '40%', height: 150, space: 4 };
    }
  }

  get isMobile(): boolean {
    return window.innerWidth > 599;
  }
}

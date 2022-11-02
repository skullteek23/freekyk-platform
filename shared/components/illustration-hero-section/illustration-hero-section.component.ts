import { Component, Input, OnInit } from '@angular/core';
import { PAGE_VIEWS_MAIN } from 'src/app/dashboard/constants/constants';

@Component({
  selector: 'app-illustration-hero-section',
  templateUrl: './illustration-hero-section.component.html',
  styleUrls: ['./illustration-hero-section.component.scss'],
})
export class IllustrationHeroSectionComponent implements OnInit {
  @Input() svgSrc: string;
  @Input() pageView = PAGE_VIEWS_MAIN.LANDING_PAGE;
  @Input() isEnlarge = false;
  constructor() {}

  ngOnInit(): void {}
  getClass(): string {
    if (!this.pageView) {
      return;
    }
    switch (this.pageView) {
      case PAGE_VIEWS_MAIN.LANDING_PAGE:
        return 'banner';
      case PAGE_VIEWS_MAIN.PLAY_PAGE:
        return;
      case PAGE_VIEWS_MAIN.FREESTYLE_PAGE:
        return;
      case PAGE_VIEWS_MAIN.SUPPORT_PAGE:
        return;
      case PAGE_VIEWS_MAIN.FAQ_PAGE:
        return;
      case PAGE_VIEWS_MAIN.ACADEMIES_PAGE:
        return;
      case PAGE_VIEWS_MAIN.EQUIPMENT_PAGE:
        return;
      case PAGE_VIEWS_MAIN.ABOUT_PAGE:
        return;
      case PAGE_VIEWS_MAIN.TERMS_PAGE:
        return;
      case PAGE_VIEWS_MAIN.PRIVACY_PAGE:
        return;

      default:
        return;
    }
  }
}

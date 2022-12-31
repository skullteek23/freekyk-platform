import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LOREM_IPSUM } from '../../web-content/WEBSITE_CONTENT';
import { FeatureSectionContent } from '../../interfaces/others.model';

@Component({
  selector: 'app-feature-section',
  templateUrl: './feature-section.component.html',
  styleUrls: ['./feature-section.component.scss'],
})
export class FeatureSectionComponent implements OnInit {
  @Input('invert') flexOrderInvert = false;
  @Input('featureContent') content: FeatureSectionContent = {
    subHeading: 'Heading',
    CTA: {
      text: 'Explore More',
      link: '/',
    },
    desc: LOREM_IPSUM,
  };
  @Input() svg = 'assets/svgs/Banner/play_banner_small.svg';

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void { }

  onNavigate(route: string): void {
    this.router.navigate([route]);
  }
}

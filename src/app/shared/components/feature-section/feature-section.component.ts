import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LOREM_IPSUM } from '../../Constants/WEBSITE_CONTENT';
import { FeatureInfoComponent } from '../../dialogs/feature-info/feature-info.component';
import { FeatureSectionContent } from '../../interfaces/others.model';

@Component({
  selector: 'app-feature-section',
  templateUrl: './feature-section.component.html',
  styleUrls: ['./feature-section.component.css'],
})
export class FeatureSectionComponent implements OnInit {
  // tslint:disable: no-input-rename
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
  @Input('openDialog') isDialog = false;
  @Input('DialogData') LearnData = '';

  constructor(private dialog: MatDialog, private router: Router) {}
  ngOnInit(): void {}
  onNavigate(route: string): void {
    this.router.navigate([route]);
  }
  onLearnMore(): void {
    this.dialog.open(FeatureInfoComponent, {
      panelClass: 'large-dialogs',
      data: this.LearnData,
    });
  }
}

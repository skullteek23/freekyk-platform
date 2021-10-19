import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LOREM_IPSUM } from '../../Constants/WEBSITE_CONTENT';
import { FeatureInfoComponent } from '../../dialogs/feature-info/feature-info.component';

@Component({
  selector: 'app-feature-section',
  templateUrl: './feature-section.component.html',
  styleUrls: ['./feature-section.component.css'],
})
export class FeatureSectionComponent implements OnInit {
  // tslint:disable: no-input-rename
  @Input('invert') flexOrderInvert = false;
  @Input('featureContent') content: {
    head: string;
    route: string;
    desc: string;
  } = {
    head: 'Heading',
    route: '/',
    desc: LOREM_IPSUM,
  };
  @Input('openDialog') isDialog = false;
  @Input('DialogData') LearnData = '';
  constructor(private dialog: MatDialog, private router: Router) {}
  ngOnInit(): void {}
  onNavigate(route: string) {
    this.router.navigate([route]);
  }
  onLearnMore() {
    this.dialog.open(FeatureInfoComponent, {
      panelClass: 'large-dialogs',
      data: this.LearnData,
    });
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FeatureInfoComponent } from '../../dialogs/feature-info/feature-info.component';

@Component({
  selector: 'app-feature-section',
  templateUrl: './feature-section.component.html',
  styleUrls: ['./feature-section.component.css'],
})
export class FeatureSectionComponent implements OnInit {
  @Input('invert') flexOrderInvert: boolean = false;
  @Input('featureContent') content: { head: string; route: string } = {
    head: 'NA',
    route: 'NA',
  };
  @Input('openDialog') isDialog: boolean = false;
  @Input('DialogData') LearnData: string = '';
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

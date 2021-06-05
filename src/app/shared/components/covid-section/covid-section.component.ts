import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeatureInfoComponent } from '../../dialogs/feature-info/feature-info.component';

@Component({
  selector: 'app-covid-section',
  templateUrl: './covid-section.component.html',
  styleUrls: ['./covid-section.component.css'],
})
export class CovidSectionComponent implements OnInit {
  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {}
  onLearnMore(learnData: any) {
    this.dialog.open(FeatureInfoComponent, {
      panelClass: 'large-dialogs',
      data: learnData,
    });
  }
}

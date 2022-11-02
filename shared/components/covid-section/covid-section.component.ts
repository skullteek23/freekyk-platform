import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { COVID_PRECAUTIONS } from '../../Constants/WEBSITE_CONTENT';
import { FeatureInfoComponent } from '../../dialogs/feature-info/feature-info.component';

@Component({
  selector: 'app-covid-section',
  templateUrl: './covid-section.component.html',
  styleUrls: ['./covid-section.component.scss'],
})
export class CovidSectionComponent implements OnInit {
  readonly covidContent = COVID_PRECAUTIONS;
  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {}
  onLearnMore(learnData: any): void {
    this.dialog.open(FeatureInfoComponent, {
      panelClass: 'large-dialogs',
      data: learnData,
    });
  }
}

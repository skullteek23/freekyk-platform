import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { COVID_LEARN_MORE, COVID_PRECAUTIONS } from '../../web-content/WEBSITE_CONTENT';
import { FeatureInfoComponent, IFeatureInfoOptions } from '../../dialogs/feature-info/feature-info.component';

@Component({
  selector: 'app-covid-section',
  templateUrl: './covid-section.component.html',
  styleUrls: ['./covid-section.component.scss'],
})
export class CovidSectionComponent implements OnInit {
  readonly covidContent = COVID_PRECAUTIONS;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void { }

  onLearnMore(): void {
    const data: IFeatureInfoOptions = {
      heading: COVID_LEARN_MORE.heading,
      description: COVID_LEARN_MORE.desc,
    };
    this.dialog.open(FeatureInfoComponent, {
      panelClass: 'large-dialogs',
      data,
    });
  }
}

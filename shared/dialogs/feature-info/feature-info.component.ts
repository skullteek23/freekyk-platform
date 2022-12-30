import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LOREM_IPSUM_LONG } from '../../Constants/WEBSITE_CONTENT';

export interface IFeatureInfoOptions {
  heading: string;
  description?: string;
  multiDescription?: { subheading: string; description: string }[]
}
@Component({
  selector: 'app-feature-info',
  templateUrl: './feature-info.component.html',
  styleUrls: ['./feature-info.component.scss'],
})
export class FeatureInfoComponent implements OnInit {

  readonly dummyParagraph = LOREM_IPSUM_LONG;

  constructor(
    public dialogRef: MatDialogRef<FeatureInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IFeatureInfoOptions
  ) { }

  ngOnInit(): void { }

  onCloseDialog(): void {
    this.dialogRef.close();
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LOREM_IPSUM_LONG } from '../../Constants/WEBSITE_CONTENT';
@Component({
  selector: 'app-feature-info',
  templateUrl: './feature-info.component.html',
  styleUrls: ['./feature-info.component.scss'],
})
export class FeatureInfoComponent implements OnInit {

  readonly dummyParagraph = LOREM_IPSUM_LONG;

  constructor(
    public dialogRef: MatDialogRef<FeatureInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void { }

  onCloseDialog(): void {
    this.dialogRef.close();
  }
}

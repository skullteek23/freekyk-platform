import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import faker from 'faker';
@Component({
  selector: 'app-feature-info',
  templateUrl: './feature-info.component.html',
  styleUrls: ['./feature-info.component.css'],
})
export class FeatureInfoComponent implements OnInit {
  readonly dummyParagraph = faker.lorem.paragraph(10);
  constructor(
    public dialogRef: MatDialogRef<FeatureInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  ngOnInit(): void {}
  onCloseDialog() {
    this.dialogRef.close();
  }
}

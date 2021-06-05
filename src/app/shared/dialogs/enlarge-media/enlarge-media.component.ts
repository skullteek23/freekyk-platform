import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-enlarge-media',
  templateUrl: './enlarge-media.component.html',
  styleUrls: ['./enlarge-media.component.css'],
})
export class EnlargeMediaComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<EnlargeMediaComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { media: 'image' | 'video'; path: string }
  ) {}

  ngOnInit(): void {}
  onCloseDialog() {
    this.dialogRef.close();
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-reschedule-match-dialog',
  templateUrl: './reschedule-match-dialog.component.html',
  styleUrls: ['./reschedule-match-dialog.component.scss']
})
export class RescheduleMatchDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<RescheduleMatchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public matchID: string,
  ) { }

  ngOnInit(): void {
  }

  onCloseDialog() {
    this.dialogRef.close();
  }
}

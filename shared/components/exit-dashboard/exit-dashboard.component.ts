import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-exit-dashboard',
  templateUrl: './exit-dashboard.component.html',
  styleUrls: ['./exit-dashboard.component.css'],
})
export class ExitDashboardComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<ExitDashboardComponent>) {}
  ngOnInit(): void {}
  onCloseDialog(response: boolean) {
    this.dialogRef.close(response);
  }
}

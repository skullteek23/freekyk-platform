import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-update-match-report',
  templateUrl: './update-match-report.component.html',
  styleUrls: ['./update-match-report.component.css']
})
export class UpdateMatchReportComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<UpdateMatchReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
  ) { }

  ngOnInit(): void {
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

}

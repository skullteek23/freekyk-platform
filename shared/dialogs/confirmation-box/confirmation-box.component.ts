import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-box',
  templateUrl: './confirmation-box.component.html',
  styleUrls: ['./confirmation-box.component.scss'],
})
export class ConfirmationBoxComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ConfirmationBoxComponent>
  ) { }

  ngOnInit(): void { }

  onCloseDialog(response: boolean = false): void {
    this.dialogRef.close(response);
  }
}

import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-deactivate-account',
  templateUrl: './deactivate-account.component.html',
  styleUrls: ['./deactivate-account.component.css'],
})
export class DeactivateAccountComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<DeactivateAccountComponent>) {}

  ngOnInit(): void {}
  onCloseDialog(): void {
    this.dialogRef.close();
  }
}

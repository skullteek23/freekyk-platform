import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-invite-accept-card',
  templateUrl: './invite-accept-card.component.html',
  styleUrls: ['./invite-accept-card.component.scss'],
})
export class InviteAcceptCardComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<InviteAcceptCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {}

  ngOnInit(): void {}
  onCloseDialog(response: 'accept' | 'reject'): void {
    this.dialogRef.close(response);
  }
}

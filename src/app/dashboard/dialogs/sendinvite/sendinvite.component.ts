import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-sendinvite',
  templateUrl: './sendinvite.component.html',
  styleUrls: ['./sendinvite.component.scss'],
})
export class SendinviteComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SendinviteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string; id: string }
  ) { }

  ngOnInit(): void { }

  onCloseDialog(response = false): void {
    this.dialogRef.close(response);
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UNIQUE_DELETION_REQUEST_CODE } from '../../shared/constants/constants';

@Component({
  selector: 'app-request-dialog',
  templateUrl: './request-dialog.component.html',
  styleUrls: ['./request-dialog.component.css']
})
export class RequestDialogComponent implements OnInit {

  reason: string = null;
  mid: string = null;

  constructor(
    public dialogRef: MatDialogRef<RequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { season: string; heading: string; isShowMatch: boolean },
    private ngFire: AngularFirestore
  ) { }

  ngOnInit(): void {
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  sendRequestToAdmin() {
    if (this.isReasonValid) {
      const timestamp = new Date().getTime();
      const uniqueRequestID = UNIQUE_DELETION_REQUEST_CODE + '-' + this.ngFire.createId().slice(0, 5);
      const requestData = {
        id: uniqueRequestID,
        seasonId: this.data.season,
        timestamp,
        reason: this.reason,
      };
      if (this.data.isShowMatch) {
        requestData.mid = this.mid;
      }
      this.reason = null;
      this.mid = null;
      this.onCloseDialogWithData(requestData);
    }
  }

  onCloseDialogWithData(data) {
    this.dialogRef.close(data);
  }

  get isReasonValid(): boolean {
    return this.reason && this.reason.length <= 1000;
  }

}

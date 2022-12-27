import { Component, Inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UNIQUE_DELETION_REQUEST_CODE } from '@shared/constants/constants';
import { ActionRequest } from '@shared/interfaces/admin.model';

export interface IRequestData { seasonID: string; heading: string; isShowMatch: boolean }

@Component({
  selector: 'app-request-dialog',
  templateUrl: './request-dialog.component.html',
  styleUrls: ['./request-dialog.component.scss']
})
export class RequestDialogComponent {

  reason: string = null;
  mid: string = null;

  constructor(
    public dialogRef: MatDialogRef<RequestDialogComponent>,
    private ngFire: AngularFirestore,
    @Inject(MAT_DIALOG_DATA) public data: IRequestData
  ) { }

  onCloseDialog() {
    this.dialogRef.close();
  }

  sendRequestToAdmin() {
    if (this.isReasonValid) {
      const timestamp = new Date().getTime();
      const uniqueRequestID = UNIQUE_DELETION_REQUEST_CODE + '-' + this.ngFire.createId().slice(0, 5);
      const uid = sessionStorage.getItem('uid');
      const requestData: ActionRequest = {
        id: uniqueRequestID,
        uid,
        timestamp,
        reason: this.reason,
        referenceID: this.data.isShowMatch ? this.mid : this.data.seasonID
      };
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

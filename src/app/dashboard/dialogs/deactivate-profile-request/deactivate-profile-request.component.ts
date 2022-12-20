import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef } from '@angular/material/dialog';
import { UNIQUE_DELETION_REQUEST_CODE } from '@shared/constants/constants';
import { ActionRequest } from '@shared/interfaces/admin.model';

@Component({
  selector: 'app-deactivate-profile-request',
  templateUrl: './deactivate-profile-request.component.html',
  styleUrls: ['./deactivate-profile-request.component.scss']
})
export class DeactivateProfileRequestComponent {

  reason: string = null;

  constructor(
    public dialogRef: MatDialogRef<DeactivateProfileRequestComponent>,
    private ngFire: AngularFirestore,
  ) { }

  onCloseDialog() {
    this.dialogRef.close();
  }

  sendRequestToAdmin() {
    const uid = localStorage.getItem('uid');
    if (this.isReasonValid && uid) {
      const timestamp = new Date().getTime();
      const uniqueRequestID = UNIQUE_DELETION_REQUEST_CODE + '-' + this.ngFire.createId().slice(0, 5);
      const requestData: ActionRequest = {
        id: uniqueRequestID,
        uid,
        timestamp,
        reason: this.reason,
        referenceID: uid
      };
      this.onCloseDialogWithData(requestData);
      this.reason = null;
    }
  }

  onCloseDialogWithData(data) {
    this.dialogRef.close(data);
  }

  get isReasonValid(): boolean {
    return this.reason && this.reason.length <= 1000;
  }

}

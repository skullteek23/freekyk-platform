import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ProfileConstants } from '@shared/constants/constants';
import { ISupportTicket, TicketStatus, TicketTypes } from '@shared/interfaces/ticket.model';

@Component({
  selector: 'app-deactivate-profile-request',
  templateUrl: './deactivate-profile-request.component.html',
  styleUrls: ['./deactivate-profile-request.component.scss']
})
export class DeactivateProfileRequestComponent {

  readonly reasonLimit = ProfileConstants.DEACTIVATION_REASON_LIMIT;
  reason: string = null;

  constructor(
    public dialogRef: MatDialogRef<DeactivateProfileRequestComponent>,
  ) { }

  onCloseDialog() {
    this.dialogRef.close();
  }

  sendRequestToAdmin() {
    // const uid = localStorage.getItem('uid');
    // if (this.isReasonValid && uid) {
    //   const ticket: ISupportTicket = {
    //     status: TicketStatus.Open,
    //     type: TicketTypes.Profile,
    //     timestamp: new Date().getTime(),
    //     uid,
    //     message: `Deactivate Profile - ${this.reason.trim()}`,
    //   }
    //   this.onCloseDialogWithData(ticket);
    //   this.reason = null;
    // }
  }

  onCloseDialogWithData(data: ISupportTicket) {
    this.dialogRef.close(data);
  }

  get isReasonValid(): boolean {
    return this.reason && this.reason.length <= this.reasonLimit;
  }

}

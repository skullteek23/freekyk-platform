import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ISupportTicket, TicketStatus, TicketTypes } from '@shared/interfaces/ticket.model';

export interface IRequestData {
  seasonID: string;
  heading: string;
  isShowMatch: boolean;
}

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
    @Inject(MAT_DIALOG_DATA) public data: IRequestData
  ) { }

  onCloseDialog() {
    this.dialogRef.close();
  }

  sendRequestToAdmin() {
    if (this.isReasonValid) {
      const timestamp = new Date().getTime();
      const uid = sessionStorage.getItem('uid');
      const message = '';
      if (this.data.isShowMatch) {
        message.concat('Match ID: ' + this.mid + '&nbsp;<br>')
      } else {
        message.concat('Season ID: ' + this.data.seasonID + '&nbsp;<br>')
      }
      message.concat(this.reason.trim());
      const ticket: ISupportTicket = {
        status: TicketStatus.Open,
        type: TicketTypes.Season,
        timestamp,
        uid,
        message,
      }
      this.reason = null;
      this.mid = null;
      this.onCloseDialogWithData(ticket);
    }
  }

  onCloseDialogWithData(ticket: ISupportTicket) {
    this.dialogRef.close(ticket);
  }

  get isReasonValid(): boolean {
    return this.reason && this.reason.length <= 1000;
  }

}

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
      const date = new Date().getTime();
      const byUID = sessionStorage.getItem('uid');
      const description = '';
      if (this.data.isShowMatch) {
        description.concat('Match ID: ' + this.mid + '&nbsp;<br>')
      } else {
        description.concat('Season ID: ' + this.data.seasonID + '&nbsp;<br>')
      }
      description.concat(this.reason.trim());
      const ticket: Partial<ISupportTicket> = {
        status: TicketStatus.Open,
        type: TicketTypes.Season,
        date,
        byUID,
        description,
      }
      this.reason = null;
      this.mid = null;
      this.onCloseDialogWithData(ticket);
    }
  }

  onCloseDialogWithData(ticket: Partial<ISupportTicket>) {
    this.dialogRef.close(ticket);
  }

  get isReasonValid(): boolean {
    return this.reason && this.reason.length <= 1000;
  }

}

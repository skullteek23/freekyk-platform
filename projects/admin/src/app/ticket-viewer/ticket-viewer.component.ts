import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { BasicTicket } from '../shared/interfaces/ticket.model';

@Component({
  selector: 'app-ticket-viewer',
  templateUrl: './ticket-viewer.component.html',
  styleUrls: ['./ticket-viewer.component.css'],
})
export class TicketViewerComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<TicketViewerComponent>,
    private ngFire: AngularFirestore,
    @Inject(MAT_DIALOG_DATA) public data: BasicTicket,
    private snackServ: SnackbarService
  ) {}
  ngOnInit(): void {}
  onCloseDialog() {
    this.dialogRef.close();
  }
  onMarkAsProcessing(ticket_id: string) {
    this.ngFire
      .collection('tickets')
      .doc(ticket_id)
      .update({
        tkt_status: 'Processing',
      })
      .then(() => {
        this.snackServ.displayCustomMsg('Ticket marked successfully!');
        this.onCloseDialog();
      });
  }
  onMarkAsCompleted(ticket_id: string) {
    this.ngFire
      .collection('tickets')
      .doc(ticket_id)
      .update({
        tkt_status: 'Complete',
      })
      .then(() => {
        this.snackServ.displayCustomMsg('Ticket marked successfully!');
        this.onCloseDialog();
      });
  }
}

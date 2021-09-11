import { Component, OnInit } from '@angular/core';
import {
  AngularFirestore,
  DocumentChangeAction,
} from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BasicTicket } from 'src/app/shared/interfaces/ticket.model';
import { TicketViewerComponent } from '../ticket-viewer/ticket-viewer.component';

@Component({
  selector: 'app-tickets-panel',
  templateUrl: './tickets-panel.component.html',
  styleUrls: ['./tickets-panel.component.css'],
})
export class TicketsPanelComponent implements OnInit {
  noResTickets = false;
  noUnResTickets = false;
  resolvedTickets$: Observable<BasicTicket[]>;
  unresolvedTickets$: Observable<BasicTicket[]>;
  constructor(private ngFire: AngularFirestore, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.getTickets();
    this.getUnresTickets();
  }
  getTickets() {
    this.resolvedTickets$ = this.ngFire
      .collection('tickets')
      .snapshotChanges()
      .pipe(
        map(this.getTicketDoc),
        map((docs) => docs.filter((doc) => doc.tkt_status == 'Complete')),
        tap((resp) => (this.noResTickets = resp.length == 0))
      );
  }
  getTicketDoc(docs: DocumentChangeAction<unknown>[]) {
    return docs.map(
      (doc) =>
        <BasicTicket>{
          id: doc.payload.doc.id,
          ...(<BasicTicket>doc.payload.doc.data()),
        }
    );
  }
  getUnresTickets() {
    this.unresolvedTickets$ = this.ngFire
      .collection('tickets')
      .snapshotChanges()
      .pipe(
        map(this.getTicketDoc),
        map((docs) =>
          docs.filter(
            (doc) =>
              doc.tkt_status == 'Processing' || doc.tkt_status == 'Recieved'
          )
        ),
        tap((resp) => (this.noUnResTickets = resp.length == 0))
      );
  }
  onSelectTicket(ticket: BasicTicket) {
    this.dialog.open(TicketViewerComponent, {
      panelClass: 'large-dialogs',
      data: ticket,
    });
  }
}

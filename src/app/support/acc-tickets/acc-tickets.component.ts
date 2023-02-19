import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { map, tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { ISupportTicket, TicketStatus, TicketTypes } from '@shared/interfaces/ticket.model';
import { ProfileConstants } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';

@Component({
  selector: 'app-acc-tickets',
  templateUrl: './acc-tickets.component.html',
  styleUrls: ['./acc-tickets.component.scss'],
})
export class AccTicketsComponent implements OnInit {

  readonly queryLimit = ProfileConstants.SUPPORT_QUERY_LIMIT;
  readonly messages = formsMessages;

  ticketStatus = true;
  newTicketForm: FormGroup = new FormGroup({});
  additionAvailable = true;
  showForm = false;
  myTickets$: Observable<ISupportTicket[]>;
  noTickets = false;

  constructor(
    private snackBarService: SnackbarService,
    private ngFire: AngularFirestore
  ) { }

  ngOnInit(): void {
    this.getTickets();
  }

  getTickets(): void {
    const uid = localStorage.getItem('uid');
    if (uid) {
      this.myTickets$ = this.ngFire
        .collection('tickets', query => query.where('uid', '==', uid))
        .snapshotChanges()
        .pipe(
          tap((resp) => (this.noTickets = resp.length === 0)),
          map((resp) =>
            resp.map(
              (doc) =>
              ({
                id: doc.payload.doc.id,
                ...(doc.payload.doc.data() as ISupportTicket),
              } as ISupportTicket)
            )
          )
        );
    }
  }

  getColor(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.Closed:
        return 'var(--primaryColor)';
      case TicketStatus.Pending:
        return 'var(--premiumServiceColor)';
      case TicketStatus.Open:
        return 'grey';
    }
  }

  getIcon(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.Closed:
        return 'check_circle';
      case TicketStatus.Pending:
        return 'pending';
      case TicketStatus.Open:
        return 'inventory';
    }
  }

  getStatus(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.Closed:
        return 'Resolved';
      case TicketStatus.Pending:
        return 'Pending';
      case TicketStatus.Open:
        return 'Open';
    }
  }

  onOpenTicketForm(): void {
    this.additionAvailable = false;
    this.showForm = true;
    this.newTicketForm = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.pattern(RegexPatterns.alphaWithSpace),
      ]),
      ph_number: new FormControl(null, [
        Validators.required,
        Validators.pattern(RegexPatterns.phoneNumber),
      ]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      query: new FormControl(null, [
        Validators.required,
        Validators.maxLength(this.queryLimit),
        Validators.pattern(RegexPatterns.query),
      ]),
    });
  }

  onDeleteTicket(ticketID: string): void {
    // backend code goes here
    this.ngFire
      .collection('tickets')
      .doc(ticketID)
      .delete()
      .then(() => this.snackBarService.displayCustomMsg('Ticket deleted successfully!'))
      .catch(() => this.snackBarService.displayError());
  }

  resetAll(): void {
    this.additionAvailable = true;
    this.showForm = false;
    this.newTicketForm.reset();
  }

  onSubmitTicket(): void {
    const uid = localStorage.getItem('uid');
    const ticket: ISupportTicket = {
      status: TicketStatus.Open,
      contactInfo: {
        name: String(this.newTicketForm.value.name)?.trim(),
        email: String(this.newTicketForm.value.email)?.trim(),
        phone_no: String(this.newTicketForm.value.ph_number)?.trim(),
      },
      type: TicketTypes.Support,
      uid,
      timestamp: new Date().getTime(),
      message: String(this.newTicketForm.value.query)?.trim()
    }
    this.ngFire.collection('tickets').add(ticket)
      .then(() => {
        this.snackBarService.displayCustomMsg('Ticket raised successfully!');
      })
      .catch(() => this.snackBarService.displayError())
      .finally(() => {
        this.resetAll();
      });
  }

  finishSubmission(): void {
    this.resetAll();
    this.snackBarService.displayCustomMsg('Ticket submitted successfully!');
  }
}

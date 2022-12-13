import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { map, tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { BasicTicket } from '@shared/interfaces/ticket.model';
import { ProfileConstants } from '@shared/constants/constants';

@Component({
  selector: 'app-acc-tickets',
  templateUrl: './acc-tickets.component.html',
  styleUrls: ['./acc-tickets.component.scss'],
})
export class AccTicketsComponent implements OnInit {
  ticketStatus = true;
  newTicketForm: FormGroup = new FormGroup({});
  additionAvailable = true;
  showForm = false;
  myTickets$: Observable<BasicTicket[]>;
  noTickets = false;
  constructor(
    private snackServ: SnackbarService,
    private ngFire: AngularFirestore
  ) { }
  ngOnInit(): void {
    this.getTickets();
  }
  getTickets(): void {
    this.myTickets$ = this.ngFire
      .collection('tickets')
      .snapshotChanges()
      .pipe(
        tap((resp) => (this.noTickets = resp.length === 0)),
        map((resp) =>
          resp.map(
            (doc) =>
            ({
              id: doc.payload.doc.id,
              ...(doc.payload.doc.data() as BasicTicket),
            } as BasicTicket)
          )
        )
      );
  }
  getColor(status: 'Complete' | 'Processing' | 'Recieved'): string {
    switch (status) {
      case 'Complete':
        return 'var(--primaryColor)';
      case 'Processing':
        return 'var(--premiumServiceColor)';
      case 'Recieved':
        return 'grey';
    }
  }
  getIcon(status: 'Complete' | 'Processing' | 'Recieved'): string {
    switch (status) {
      case 'Complete':
        return 'check_circle';
      case 'Processing':
        return 'pending';
      case 'Recieved':
        return 'inventory';
    }
  }
  getStatus(status: 'Complete' | 'Processing' | 'Recieved'): string {
    switch (status) {
      case 'Complete':
        return 'resolved';
      case 'Processing':
        return 'processing';
      case 'Recieved':
        return 'request recieved';
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
        Validators.maxLength(ProfileConstants.SUPPORT_QUERY_LIMIT),
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
      .then(() => this.snackServ.displayCustomMsg('Ticket deleted successfully!'));
  }
  resetAll(): void {
    this.additionAvailable = true;
    this.showForm = false;
  }
  onSubmitTicket(): void {
    // backend code goes here
    // console.log(this.newTicketForm);
    this.ngFire
      .collection('tickets')
      .add({
        ...this.newTicketForm.value,
        ticket_UID: (
          this.ngFire.createId() + Date.now().toString().slice(0, 5)
        ).toUpperCase(),
        tkt_date: new Date(),
        tkt_status: 'Recieved',
      } as BasicTicket)
      .then(this.finishSubmission.bind(this));
  }
  finishSubmission(): void {
    this.resetAll();
    this.snackServ.displayCustomMsg('Ticket submitted successfully!');
  }
}

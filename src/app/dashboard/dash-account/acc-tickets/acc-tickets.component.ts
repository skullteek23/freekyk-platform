import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { BasicTicket } from 'src/app/shared/interfaces/ticket.model';

@Component({
  selector: 'app-acc-tickets',
  templateUrl: './acc-tickets.component.html',
  styleUrls: ['./acc-tickets.component.css'],
})
export class AccTicketsComponent implements OnInit {
  ticketStatus = true;
  newTicketForm: FormGroup = new FormGroup({});
  additionAvailable = true;
  showForm = false;
  myTickets$: Observable<BasicTicket[]>;
  noTickets: boolean = false;
  constructor(
    private snackServ: SnackbarService,
    private ngFire: AngularFirestore
  ) {}
  ngOnInit(): void {
    this.getTickets();
  }
  getTickets() {
    this.myTickets$ = this.ngFire
      .collection('tickets')
      .snapshotChanges()
      .pipe(
        tap((resp) => (this.noTickets = resp.length == 0)),
        map(
          (resp) => <BasicTicket[]>resp.map(
              (doc) =>
                <BasicTicket>{
                  id: doc.payload.doc.id,
                  ...(<BasicTicket>doc.payload.doc.data()),
                }
            )
        )
      );
  }
  getColor(status: 'Complete' | 'Processing' | 'Recieved') {
    switch (status) {
      case 'Complete':
        return 'var(--primaryColor)';
      case 'Processing':
        return 'var(--premiumServiceColor)';
      case 'Recieved':
        return 'grey';
    }
  }
  getIcon(status: 'Complete' | 'Processing' | 'Recieved') {
    switch (status) {
      case 'Complete':
        return 'check_circle';
      case 'Processing':
        return 'pending';
      case 'Recieved':
        return 'inventory';
    }
  }
  getStatus(status: 'Complete' | 'Processing' | 'Recieved') {
    switch (status) {
      case 'Complete':
        return 'resolved';
      case 'Processing':
        return 'processing';
      case 'Recieved':
        return 'request recieved';
    }
  }
  onOpenTicketForm() {
    this.additionAvailable = false;
    this.showForm = true;
    this.newTicketForm = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z ]*$'),
      ]),
      ph_number: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.minLength(10),
        Validators.maxLength(10),
      ]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      query: new FormControl(null, [
        Validators.required,
        Validators.maxLength(300),
        Validators.pattern('^[a-zA-Z"0-9 ,:!.?\'/]*$'),
      ]),
    });
  }
  onDeleteTicket(ticket_ID: string) {
    // backend code goes here
    this.ngFire
      .collection('tickets')
      .doc(ticket_ID)
      .delete()
      .then(() => this.snackServ.displayDelete());
  }
  resetAll() {
    this.additionAvailable = true;
    this.showForm = false;
  }
  onSubmitTicket() {
    // backend code goes here
    console.log(this.newTicketForm);
    this.ngFire
      .collection('tickets')
      .add(<BasicTicket>{
        ...this.newTicketForm.value,
        ticket_UID: (
          this.ngFire.createId() + Date.now().toString().slice(0, 5)
        ).toUpperCase(),
        tkt_date: new Date(),
        tkt_status: 'Recieved',
      })
      .then(this.finishSubmission.bind(this));
  }
  finishSubmission() {
    this.resetAll();
    this.snackServ.displayCustomMsg('Ticket submitted successfully!');
  }
}

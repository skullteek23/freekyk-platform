import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SnackbarService } from '../services/snackbar.service';
import { BasicTicket } from '../shared/interfaces/ticket.model';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css'],
})
export class SupportComponent implements OnInit {
  ticketForm: FormGroup;
  activeIndex = 0;
  ngOnInit(): void {}
  constructor(
    private snackServ: SnackbarService,
    private ngFire: AngularFirestore
  ) {
    this.ticketForm = new FormGroup({
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
  onSubmitTicket(): void {
    if (this.ticketForm.valid) {
      this.ngFire
        .collection('tickets')
        .add({
          ...this.ticketForm.value,
          ticket_UID: (
            this.ngFire.createId() + Date.now().toString().slice(0, 5)
          ).toUpperCase(),
          tkt_date: new Date(),
          tkt_status: 'Recieved',
        } as BasicTicket)
        .then(() => {
          this.snackServ.displaySent();
          this.ticketForm.reset();
        });
    } else {
      this.snackServ.displayError();
    }
    window.scrollTo(0, 0);
  }
}

import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '../services/snackbar.service';
import { heroCallToAction } from '@shared/interfaces/others.model';
import { BasicTicket } from '@shared/interfaces/ticket.model';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent implements OnInit {
  ticketForm: FormGroup;
  activeIndex = 0;
  activePage: {
    svg: string;
    title: string;
    CTA: heroCallToAction | false;
  };
  constructor(
    private snackServ: SnackbarService,
    private ngFire: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute
  ) { }
  ngOnInit(): void {
    if (this.router.url.includes('faqs')) {
      this.activeIndex = 1;
      this.activePage = {
        svg: 'assets/svgs/Banner/faqs.svg',
        title: 'FAQs',
        CTA: false,
      };
    } else {
      this.activeIndex = 0;
      this.activePage = {
        svg: 'assets/svgs/Banner/support.svg',
        title: 'help & support',
        CTA: { name: 'raise a ticket', route: '/support' },
      };
    }
    this.initForm();
  }
  initForm(): void {
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
          this.snackServ.displayCustomMsg('Ticket registered successfully!');
          this.ticketForm.reset();
        });
    } else {
      this.snackServ.displayError('Unable to register ticket!');
    }
    window.scrollTo(0, 0);
  }
  onChangeTab(ev: MatTabChangeEvent): void {
    if (ev.index === 1) {
      this.router.navigate(['/support', 'faqs']);
    } else {
      this.router.navigate(['/support']);
    }
  }
}

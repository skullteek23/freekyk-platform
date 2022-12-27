import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '../services/snackbar.service';
import { heroCallToAction } from '@shared/interfaces/others.model';
import { BasicTicket } from '@shared/interfaces/ticket.model';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { ProfileConstants } from '@shared/constants/constants';
import { SOCIAL_MEDIA_PRE } from '@shared/Constants/DEFAULTS';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent implements OnInit {

  readonly fb = SOCIAL_MEDIA_PRE.fb;
  readonly ig = SOCIAL_MEDIA_PRE.ig;
  readonly tw = SOCIAL_MEDIA_PRE.tw;
  readonly yt = SOCIAL_MEDIA_PRE.yt;
  readonly linkedIn = SOCIAL_MEDIA_PRE.linkedIn;

  ticketForm: FormGroup;
  activeIndex = 0;
  activePage: {
    svg: string;
    title: string;
    CTA: heroCallToAction | false;
  };

  constructor(
    private snackBarService: SnackbarService,
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
      name: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaWithSpace)]),
      ph_number: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.phoneNumber)]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      query: new FormControl(null, [Validators.required, Validators.maxLength(ProfileConstants.SUPPORT_QUERY_LIMIT), Validators.pattern(RegexPatterns.query)]),
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
          this.snackBarService.displayCustomMsg('Ticket registered successfully!');
          this.ticketForm.reset();
        })
        .catch(() => this.snackBarService.displayError());
    } else {
      this.snackBarService.displayError('Unable to register ticket!');
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

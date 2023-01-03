import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { SnackbarService } from '../services/snackbar.service';
import { heroCallToAction } from '@shared/interfaces/others.model';
import { ISupportTicket, TicketStatus, TicketTypes } from '@shared/interfaces/ticket.model';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { MatchConstants, ProfileConstants } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { SUPPORT_PAGE } from '@shared/web-content/WEBSITE_CONTENT';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent implements OnInit {

  readonly fb = MatchConstants.SOCIAL_MEDIA_PRE.fb;
  readonly ig = MatchConstants.SOCIAL_MEDIA_PRE.ig;
  readonly tw = MatchConstants.SOCIAL_MEDIA_PRE.tw;
  readonly yt = MatchConstants.SOCIAL_MEDIA_PRE.yt;
  readonly linkedIn = MatchConstants.SOCIAL_MEDIA_PRE.linkedIn;
  readonly queryLimit = ProfileConstants.SUPPORT_QUERY_LIMIT;
  readonly messages = formsMessages;
  readonly description = SUPPORT_PAGE.banner;

  activeIndex = 0;
  activePage: {
    svg: string;
    title: string;
    CTA: heroCallToAction | false;
  };
  ticketForm: FormGroup;
  isTicketSubmitted = false;

  constructor(
    private snackBarService: SnackbarService,
    private ngFire: AngularFirestore,
    private router: Router
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
      query: new FormControl(null, [Validators.required, Validators.maxLength(this.queryLimit), Validators.pattern(RegexPatterns.query)]),
    });
  }

  onSubmitTicket(): void {
    if (this.ticketForm.valid) {
      const ticket: ISupportTicket = {
        status: TicketStatus.Open,
        contactInfo: {
          name: String(this.ticketForm.value.name)?.trim(),
          email: String(this.ticketForm.value.email)?.trim(),
          phone_no: String(this.ticketForm.value.ph_number)?.trim(),
        },
        type: TicketTypes.Support,
        timestamp: new Date().getTime(),
        message: String(this.ticketForm.value.query)?.trim(),
        uid: 'NA'
      }
      const uid = localStorage.getItem('uid');
      if (uid) {
        ticket.uid = uid;
      }
      this.ngFire.collection('tickets').add(ticket)
        .then(() => {
          this.isTicketSubmitted = true;
          this.snackBarService.displayCustomMsg('Enquiry submitted successfully!');
        })
        .catch(() => this.snackBarService.displayError())
        .finally(() => {
          this.ticketForm.reset();
        });
    }
  }

  onChangeTab(ev: MatTabChangeEvent): void {
    if (ev.index === 1) {
      this.router.navigate(['/support', 'faqs']);
    } else {
      this.router.navigate(['/support']);
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { NavigationEnd, Router } from '@angular/router';
import { SnackbarService } from '../services/snackbar.service';
import { heroCallToAction, ListOption } from '@shared/interfaces/others.model';
import { ISupportTicket, TicketStatus, TicketTypes } from '@shared/interfaces/ticket.model';
import { RegexPatterns } from '@shared/constants/REGEX';
import { MatchConstants, ProfileConstants } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { SUPPORT_PAGE } from '@shared/web-content/WEBSITE_CONTENT';
import { Subscription } from 'rxjs';
import { ICommunicationDialogData, UserQuestionsCommunicationComponent } from '@shared/dialogs/user-questions-communication/user-questions-communication.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@app/services/auth.service';
import { ApiPostService } from '@shared/services/api.service';
import { SupportTicketService } from './support-ticket.service';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent implements OnInit {

  subscriptions = new Subscription();
  links: ListOption[] = [
    { value: '/support/faqs', viewValue: 'FAQs' },
    { value: '/support/tickets', viewValue: 'My Tickets' }
  ];
  activeLink = '';
  isLoaderShown = false;

  constructor(
    private snackBarService: SnackbarService,
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private apiPostService: ApiPostService,
    private supportService: SupportTicketService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.router.events.subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          this.activeLink = event.url.slice('/support/'.length);
          window.scrollTo(0, 0);
        }
      })
    )
  }

  openTicketForm() {
    const data: ICommunicationDialogData = {
      heading: 'Raise a Ticket!',
      showTips: false,
      CTA: {
        icon: 'send',
        label: 'Submit'
      }
    }
    const dialogRef = this.dialog.open(UserQuestionsCommunicationComponent, {
      panelClass: 'large-dialogs',
      disableClose: true,
      data
    });

    dialogRef.afterClosed()
      .subscribe(response => {
        if (response?.hasOwnProperty('title')) {
          // this.saveQuestion(response);
          this.saveTicket(response);
        }
      })
  }

  saveTicket(response) {
    this.authService.isLoggedIn().subscribe({
      next: user => {
        this.isLoaderShown = true;
        const ticket: Partial<ISupportTicket> = {};
        if (user) {
          ticket['byUID'] = user.uid;
        }
        ticket['title'] = response.title;
        ticket['description'] = response.description;
        ticket['date'] = new Date().getTime();
        ticket['status'] = TicketStatus.Open;
        ticket['type'] = TicketTypes.Support;

        this.apiPostService.saveTicket(ticket)
          .then(() => {
            this.snackBarService.displayCustomMsg('Ticket created successfully!');
          })
          .catch(() => {
            this.snackBarService.displayError('Error: Unable to save ticket!');
          })
          .finally(() => {
            this.isLoaderShown = false;
            this.supportService.updateList();
          })
      }
    })
  }
}

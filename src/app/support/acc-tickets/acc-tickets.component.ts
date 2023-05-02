import { Component, Input, OnInit } from '@angular/core';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { ISupportTicket, TicketStatus, TicketTypes } from '@shared/interfaces/ticket.model';
import { MatchConstants, ProfileConstants } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { AuthService } from '@app/services/auth.service';
import { ApiGetService, ApiPostService } from '@shared/services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { IUserChat } from '@shared/interfaces/team.model';
import { TeamChatThreadComponent } from '@shared/dialogs/team-chat-thread/team-chat-thread.component';
import { SupportTicketService } from '../support-ticket.service';

@Component({
  selector: 'app-acc-tickets',
  templateUrl: './acc-tickets.component.html',
  styleUrls: ['./acc-tickets.component.scss'],
})
export class AccTicketsComponent implements OnInit {

  readonly queryLimit = ProfileConstants.SUPPORT_QUERY_LIMIT;
  readonly CUSTOM_FORMAT = MatchConstants.NOTIFICATION_DATE_FORMAT;
  readonly messages = formsMessages;

  tickets: ISupportTicket[] = [];
  isLoaderShown = false;
  isLogged = false;
  userID: string = null;

  @Input() set refreshList(value: boolean) {
    if (value) {
      this.getTickets();
    }
  }

  constructor(
    private snackBarService: SnackbarService,
    private authService: AuthService,
    private apiService: ApiGetService,
    private dialog: MatDialog,
    private apiPostService: ApiPostService,
    private supportService: SupportTicketService
  ) { }

  ngOnInit(): void {
    this.initTickets();
    this.initListener();
  }

  initTickets(): void {
    this.authService.isLoggedIn().subscribe({
      next: user => {
        this.isLogged = user && user.hasOwnProperty('uid');
        if (user) {
          this.userID = user.uid;
          this.getTickets();
        } else {
          this.tickets = [];
        }
      }
    });
  }

  initListener() {
    this.supportService._onListChange().subscribe({
      next: (response) => {
        if (response) {
          this.getTickets();
        }
      }
    })
  }

  getTickets() {
    if (this.userID) {
      this.showLoader();
      this.apiService.getUserTickets(this.userID)
        .subscribe({
          next: (response) => {
            if (response) {
              this.tickets = response;
            }
            this.hideLoader();
          },
          error: () => {
            this.snackBarService.displayError('Error: Unable to get tickets!');
            this.hideLoader();
          }
        });
    }
  }

  // openTicketForm() {
  //   const data: ICommunicationDialogData = {
  //     heading: 'Raise a Ticket!',
  //     showTips: true,
  //     CTA: {
  //       icon: 'send',
  //       label: 'Submit'
  //     }
  //   }
  //   const dialogRef = this.dialog.open(UserQuestionsCommunicationComponent, {
  //     panelClass: 'large-dialogs',
  //     disableClose: true,
  //     data
  //   });

  //   dialogRef.afterClosed()
  //     .subscribe(response => {
  //       if (response?.hasOwnProperty('title')) {
  //         // this.saveQuestion(response);
  //         this.saveTicket(response);
  //       }
  //     })
  // }

  openChatThread(value: ISupportTicket) {
    const chat: Partial<IUserChat> = {
      title: value.title,
      description: value.description,
      byUID: value.byUID,
      date: value.date,
      id: value.id,
    }
    this.dialog.open(TeamChatThreadComponent, {
      panelClass: 'large-dialogs',
      disableClose: false,
      data: chat
    }).afterClosed().subscribe({
      next: (response) => {
        if (response === 'delete-thread') {
          this.deleteTicket(value.id);
        }
      }
    })
  }

  deleteTicket(ticketID: string) {
    if (ticketID) {
      this.isLoaderShown = true;
      this.apiPostService.deleteTicket(ticketID)
        .then(() => {
          this.snackBarService.displayCustomMsg('Ticket deleted successfully!');
        })
        .catch(() => {
          this.snackBarService.displayError('Error: Unable to delete ticket!');
        })
        .finally(() => {
          this.isLoaderShown = false;
          this.getTickets();
        })
    }

  }

  // saveTicket(response) {
  //   this.authService.isLoggedIn().subscribe({
  //     next: user => {
  //       this.isLoaderShown = true;
  //       const ticket: Partial<ISupportTicket> = {};
  //       if (user) {
  //         ticket['byUID'] = user.uid;
  //       }
  //       ticket['title'] = response.title;
  //       ticket['description'] = response.description;
  //       ticket['date'] = new Date().getTime();
  //       ticket['status'] = TicketStatus.Open;
  //       ticket['type'] = TicketTypes.Support;

  //       this.apiPostService.saveTicket(ticket)
  //         .then(() => {
  //           this.snackBarService.displayCustomMsg('Ticket created successfully!');
  //         })
  //         .catch(() => {
  //           this.snackBarService.displayError('Error: Unable to save ticket!');
  //         })
  //         .finally(() => {
  //           this.isLoaderShown = false;
  //           this.getTickets();
  //         })
  //     }
  //   })
  // }

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

  showLoader() {
    this.isLoaderShown = true
  }

  hideLoader() {
    this.isLoaderShown = false
  }
}

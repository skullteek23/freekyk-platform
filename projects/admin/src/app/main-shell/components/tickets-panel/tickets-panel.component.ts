import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { SnackbarService } from '@shared/services/snackbar.service';
import { MatchConstants } from '@shared/constants/constants';
import { ConfirmationBoxComponent } from '@shared/dialogs/confirmation-box/confirmation-box.component';
import { TeamChatThreadComponent } from '@shared/dialogs/team-chat-thread/team-chat-thread.component';
import { IUserChat } from '@shared/interfaces/team.model';
import { ISupportTicket, TicketStatus, TicketTypes } from '@shared/interfaces/ticket.model';
import { ApiGetService } from '@shared/services/api.service';

@Component({
  selector: 'app-tickets-panel',
  templateUrl: './tickets-panel.component.html',
  styleUrls: ['./tickets-panel.component.scss']
})
export class TicketsPanelComponent implements OnInit {

  readonly LABEL_NA = MatchConstants.LABEL_NOT_AVAILABLE;
  readonly ticketStatus = TicketStatus;
  readonly ticketType = TicketTypes;
  readonly tableColumns = {
    id: 'id',
    // name: 'name',
    message: 'message',
    response: 'response',
    status: 'status',
    timestamp: 'timestamp',
  };
  readonly tableUIColumns = {
    id: 'Ticket #',
    name: 'Contact Info',
    message: 'Query',
    response: 'Reply',
    status: 'Status',
    timestamp: 'Received on',
  };
  readonly displayedCols = [
    'id',
    // 'name',
    'message',
    'response',
    'status',
    'timestamp',
  ];
  readonly TICKET_STATUS = [
    { viewValue: 'Open', value: TicketStatus.Open },
    { viewValue: 'Pending', value: TicketStatus.Pending },
    { viewValue: 'Closed', value: TicketStatus.Closed },
  ];

  dataSource = new MatTableDataSource<any>([]);
  isLoaderShown = false;
  tableLength = 0;

  constructor(
    private ngFire: AngularFirestore,
    private snackbarService: SnackbarService,
    private dialog: MatDialog,
    private apiGetService: ApiGetService
  ) { }

  ngOnInit(): void {
    this.getTickets();
  }

  getTickets() {
    this.isLoaderShown = true;
    this.apiGetService.getAllTickets().subscribe({
      next: (response) => {
        this.setDataSource(response);
        this.isLoaderShown = false;
      },
      error: () => {
        this.isLoaderShown = false;
        this.snackbarService.displayError();
      }
    })
  }

  setDataSource(data: ISupportTicket[]) {
    this.dataSource = new MatTableDataSource<any>(data);
    this.tableLength = data.length;
  }

  onChangeStatus(element: ISupportTicket, selection: MatSelectChange) {
    this.dialog.open(ConfirmationBoxComponent)
      .afterClosed()
      .subscribe({
        next: (response) => {
          if (response) {
            this.isLoaderShown = true;
            this.ngFire.collection('tickets').doc(element.id).update({ status: selection.value })
              .then(() => {
                this.snackbarService.displayCustomMsg('Ticket status changed successfully!');
                this.getTickets();
              })
              .catch(err => {
                this.snackbarService.displayError('Update operation failed');
                this.getTickets();
              });
          } else {
            this.getTickets();
          }
        }
      })
  }

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
    })
  }

}

import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '@app/services/snackbar.service';
import { TeamService } from '@app/services/team.service';
import { Store } from '@ngrx/store';
import { MatchConstants } from '@shared/constants/constants';
import { TeamChatThreadComponent } from '@shared/dialogs/team-chat-thread/team-chat-thread.component';
import { ICommunicationDialogData, UserQuestionsCommunicationComponent } from '@shared/dialogs/user-questions-communication/user-questions-communication.component';
import { IUserChat } from '@shared/interfaces/team.model';
import { take } from 'rxjs/operators';
import { TeamState } from '../store/team.reducer';

@Component({
  selector: 'app-team-communication',
  templateUrl: './team-communication.component.html',
  styleUrls: ['./team-communication.component.scss']
})
export class TeamCommunicationComponent implements OnInit {

  readonly CUSTOM_FORMAT = MatchConstants.NOTIFICATION_DATE_FORMAT;

  disableButton = false;
  showSuccess = false;
  isLoaderShown = false;
  teamID = null;
  chatList: IUserChat[] = [];

  constructor(
    private store: Store<{ team: TeamState }>,
    private teamService: TeamService,
    private dialog: MatDialog,
    private ngFire: AngularFirestore,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.getTeamStatus();
    this.getTeamChat();
  }

  getTeamStatus() {
    this.store.select('team').pipe(take(1)).subscribe(response => {
      if (response?.basicInfo?.tname) {
        this.disableButton = false;
        this.teamID = response.basicInfo.id;
        this.getTeamChat();
      } else {
        this.disableButton = true;
      }
    })
  }

  getTeamChat() {
    if (this.teamID) {
      this.ngFire.collection('teamChat').snapshotChanges()
        .subscribe({
          next: (response) => {
            if (response?.length) {
              this.chatList = response.map(res => {
                return {
                  id: res.payload.doc.id,
                  ...res.payload.doc.data() as IUserChat,
                }
              });
            } else {
              this.chatList = [];
            }
          },
          error: (response) => {
            this.snackbarService.displayError('Error getting team chat');
          }
        })
    }
  }

  openNewChat() {
    const data: ICommunicationDialogData = {
      heading: 'New Chat with Team Members',
      showTips: false,
      CTA: {
        icon: 'send',
        label: 'Send'
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
          this.saveQuestion(response);
        }
      })
  }

  openChatThread(chat: IUserChat) {
    this.dialog.open(TeamChatThreadComponent, {
      panelClass: 'large-dialogs',
      disableClose: false,
      data: chat
    })
  }

  saveQuestion(formData: any) {
    const data: Partial<IUserChat> = {};
    if (formData['title']) {
      data.title = formData['title'].trim();
    }
    if (formData['description']) {
      data.description = formData['description'].trim();
    }
    data.referenceID = sessionStorage.getItem('tid');
    data.byUID = localStorage.getItem('uid');
    data.by = sessionStorage.getItem('name');
    data.date = new Date().getTime();
    this.ngFire.collection('teamChat').add(data)
      .then(() => {
        this.showSuccess = true;
      })
      .catch(() => this.snackbarService.displayError('Unable to send question!'))
      .finally(() => { this.isLoaderShown = false; })
  }

  hideSuccess() {
    this.showSuccess = false;
  }

}

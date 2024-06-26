import { Component, OnInit, Inject, OnDestroy, Output } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from '@shared/services/snackbar.service';
import { MatchConstants, ProfileConstants } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { IUserChat, IUserChatReply } from '@shared/interfaces/team.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { Subject, Subscription } from 'rxjs';
import { ConfirmationBoxComponent } from '../confirmation-box/confirmation-box.component';

@Component({
  selector: 'app-team-chat-thread',
  templateUrl: './team-chat-thread.component.html',
  styleUrls: ['./team-chat-thread.component.scss']
})
export class TeamChatThreadComponent implements OnInit, OnDestroy {

  readonly CUSTOM_FORMAT = MatchConstants.NOTIFICATION_DATE_FORMAT;
  readonly queryDescLimit = ProfileConstants.SUPPORT_QUERY_LIMIT;
  readonly messages = formsMessages;

  repliesList: IUserChatReply[] = [];
  subscriptions = new Subscription();
  isLoaderShown = false;
  replyForm: FormGroup;
  uid = localStorage.getItem('uid');
  isEditMode = false;
  editId = null;

  constructor(
    public dialogRef: MatDialogRef<TeamChatThreadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IUserChat,
    private ngFire: AngularFirestore,
    private snackbarService: SnackbarService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getReplies();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initForm() {
    this.replyForm = new FormGroup({
      replyValue: new FormControl(null, [Validators.required, Validators.maxLength(this.queryDescLimit)]),
    })
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  getReplies() {
    this.isLoaderShown = true;
    this.ngFire.collection('chatReplies', query => query.where('userChatID', '==', this.data.id))
      .get()
      .subscribe({
        next: (response) => {
          if (response) {
            const temp: IUserChatReply[] = response.docs.map(el => ({ id: el.id, ...el.data() as IUserChatReply }));
            temp.sort(ArraySorting.sortObjectByKey('date', 'asc'));
            this.repliesList = [...temp.slice(), ...temp.slice(), ...temp.slice(), ...temp.slice()];
            const element = document.getElementById('custom-replies-list-container');
            if (element) {
              setTimeout(() => {
                this.scrollToBottom(element);
              }, 0);
            }
          } else {
            this.repliesList = [];
          }
          this.isLoaderShown = false;
        },
        error: (error) => {
          this.snackbarService.displayError('Unable to get replies!');
          this.isLoaderShown = false;
        }
      })
  }

  scrollToBottom(el) {
    el.scrollTop = el.scrollHeight - el.clientHeight;
  }

  onAddReply() {
    if (this.replyForm.invalid || !this.replyForm.dirty) {
      return;
    }
    if (this.isEditMode) {
      this.updateReply();
      return;
    }


    this.isLoaderShown = true;
    const reply: Partial<IUserChatReply> = {};
    reply.userChatID = this.data.id;
    reply.byUID = localStorage.getItem('uid');
    reply.date = new Date().getTime();
    reply.reply = this.replyForm.value.replyValue.trim();


    const isAdmin = JSON.parse(sessionStorage.getItem('isAdmin'));
    if (isAdmin) {
      reply.by = 'Freekyk Admin';
    } else {
      reply.by = sessionStorage.getItem('name');
    }

    this.ngFire.collection('chatReplies').add(reply)
      .then(() => {
        this.snackbarService.displayCustomMsg('Your reply has been added!');
        this.replyForm.reset();
        this.getReplies();
      })
      .catch(() => this.snackbarService.displayError())
      .finally(() => this.isLoaderShown = false);
  }

  updateReply() {
    if (!this.editId) {
      return;
    }
    this.isLoaderShown = true;
    const update: Partial<IUserChatReply> = {};
    update.reply = this.replyForm.value?.replyValue?.trim();
    update.date = new Date().getTime();
    this.ngFire.collection('chatReplies').doc(this.editId).update({
      ...update
    })
      .then(() => {
        this.snackbarService.displayCustomMsg('Your reply has been updated!');
        this.replyForm.reset();
        this.getReplies();
      })
      .catch(() => this.snackbarService.displayError())
      .finally(() => {
        this.isEditMode = false;
        this.editId = null;
        this.isLoaderShown = false;
      });
  }

  edit(replyID: string) {
    const reply = this.repliesList.find(el => el?.id === replyID);
    if (reply) {
      this.isEditMode = true;
      this.editId = replyID;
      this.replyForm.setValue({
        replyValue: reply.reply
      })
    }
  }

  delete(replyID: string) {
    const reply = this.repliesList.find(el => el?.id === replyID);
    if (reply) {
      this.isLoaderShown = true;
      this.ngFire.collection('chatReplies').doc(replyID).delete()
        .then(() => {
          this.snackbarService.displayCustomMsg('Your reply has been deleted!');
          this.getReplies();
        })
        .catch(() => this.snackbarService.displayError())
        .finally(() => {
          this.isEditMode = false;
          this.editId = null;
          this.isLoaderShown = false;
        });
    }
  }

  deleteThread() {
    this.dialog.open(ConfirmationBoxComponent).afterClosed().subscribe({
      next: response => {
        if (response) {
          this.dialogRef.close('delete-thread');
        }
      }
    })
  }

}

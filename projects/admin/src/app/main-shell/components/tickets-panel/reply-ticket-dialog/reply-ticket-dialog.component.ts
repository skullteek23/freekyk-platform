import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from '@app/services/snackbar.service';
import { ProfileConstants } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { ISupportTicket, TicketStatus } from '@shared/interfaces/ticket.model';

@Component({
  templateUrl: './reply-ticket-dialog.component.html',
  styleUrls: ['./reply-ticket-dialog.component.scss']
})
export class ReplyTicketDialogComponent implements OnInit {
  readonly queryLimit = ProfileConstants.SUPPORT_QUERY_LIMIT;

  replyForm: FormGroup;
  messages = formsMessages;

  constructor(
    public dialogRef: MatDialogRef<ReplyTicketDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public ticket: ISupportTicket,
    private ngFire: AngularFirestore,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.replyForm = new FormGroup({
      reply: new FormControl(null, [Validators.required, Validators.maxLength(this.queryLimit)]),
    });
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  submit() {
    if (this.replyForm.invalid) {
      return;
    }
    const update: Partial<ISupportTicket> = {};
    update.status = TicketStatus.Pending;
    update.response = this.replyForm.value.reply.trim();
    this.ngFire.collection('tickets').doc(this.ticket.id).update({
      ...update
    }).then(() => {
      this.snackbarService.displayCustomMsg('Ticket updated successfully!');
    }).catch(() => {
      this.snackbarService.displayError();
    }).finally(() => {
      this.dialogRef.close();
    })
  }


}

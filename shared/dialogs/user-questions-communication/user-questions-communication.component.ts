import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatchConstants, ProfileConstants } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';

export interface ICommunicationDialogData {
  heading: string;
  showTips: boolean;
  CTA: {
    icon: string;
    label: string;
  }
}

@Component({
  selector: 'app-user-questions-communication',
  templateUrl: './user-questions-communication.component.html',
  styleUrls: ['./user-questions-communication.component.scss']
})
export class UserQuestionsCommunicationComponent implements OnInit {

  readonly queryHeadingLimit = ProfileConstants.ASK_QUESTION_TITLE;
  readonly queryDescLimit = ProfileConstants.SUPPORT_QUERY_LIMIT;
  readonly messages = formsMessages;

  questionForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<UserQuestionsCommunicationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ICommunicationDialogData
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.questionForm = new FormGroup({
      title: new FormControl(null, [Validators.required, Validators.maxLength(this.queryHeadingLimit)]),
      description: new FormControl(null, Validators.maxLength(this.queryDescLimit)),
    })
  }

  closeDialog(data = null) {
    this.dialogRef.close(data);
  }

  submit() {
    if (this.questionForm.valid && this.questionForm.dirty) {
      this.closeDialog(this.questionForm.value);
    }
  }



}

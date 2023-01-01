import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SnackbarService } from '@app/services/snackbar.service';
import { ProfileConstants } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { IFeedback } from '@shared/interfaces/ticket.model';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

  readonly feedbackLimit = ProfileConstants.FEEDBACK_MESSAGE_LIMIT;
  readonly ratingNumbers = ProfileConstants.RATING_NUMBERS;
  readonly messages = formsMessages;

  feedbackForm: FormGroup;
  showError = false;
  showCompletion = false;

  constructor(
    public dialogRef: MatDialogRef<FeedbackComponent>,
    private ngFire: AngularFirestore,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.feedbackForm = new FormGroup({
      rating: new FormControl(null, [Validators.required, Validators.max(5), Validators.min(0)]),
      message: new FormControl('', [Validators.maxLength(this.feedbackLimit), Validators.pattern(RegexPatterns.query)])
    })
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  onSelectRating(rating: number) {
    this.feedbackForm?.patchValue({
      rating
    });
  }

  submitFeedback() {
    if (this.isSubmitDisabled) {
      return
    }
    const feedback: IFeedback = {
      rating: Number(this.feedbackForm?.value?.rating) || 0,
    }
    if (this.feedbackForm?.value?.message) {
      feedback['message'] = this.feedbackForm?.value?.message?.trim();
    }
    const uid = localStorage.getItem('uid');
    if (uid) {
      feedback['uid'] = uid;
    }
    this.ngFire.collection('feedback').add(feedback)
      .then(() => {
        this.showCompletion = true;
        this.feedbackForm?.reset();
        setTimeout(() => {
          this.onCloseDialog();
        }, 2200);
      })
      .catch((response) => this.snackbarService.displayError())
  }

  get isSubmitDisabled(): boolean {
    return this.feedbackForm?.invalid;
  }
}

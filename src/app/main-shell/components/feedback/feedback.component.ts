import { Component, Inject, OnInit } from '@angular/core';
import { FeedbackFormatters, FeedbackReasons, FeedbackReasonsHighlights, IFeedback, IFeedbackReason, IPendingFeedback } from '@shared/interfaces/feedback.model';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ListOption } from '@shared/interfaces/others.model';
import { ApiGetService, ApiPostService } from '@shared/services/api.service';

export interface ISelection extends ListOption {
  selected: boolean;
}

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

  readonly formatter = FeedbackFormatters;
  readonly reasons = FeedbackReasons;

  rating = 0;
  isShowMoreIssues = false;
  isSubmitted = false;
  isLoaderShown = false;
  highlights: ISelection[] = [];
  allIssuesList: ISelection[] = [];

  constructor(
    private apiGetService: ApiGetService,
    private apiPostService: ApiPostService,
    private _bottomSheetRef: MatBottomSheetRef<FeedbackComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public dialogData: IPendingFeedback
  ) { }

  ngOnInit(): void {
    this.initReasons();
  }

  initReasons() {
    FeedbackReasonsHighlights.forEach(el => {
      this.highlights.push({
        ...el,
        selected: false
      });
    });
  }

  dismiss() {
    this._bottomSheetRef.dismiss();
  }

  onChangeRating(newValue: number) {
    if (newValue !== 0 && newValue !== this.rating) {
      this.rating = newValue;
    }
    console.log(this.rating);
  }

  submitFeedback() {
    this.isLoaderShown = true;
    const selectedIssues = this.allIssuesList.filter(el => el.selected);
    const feedbackID = this.apiGetService.getUniqueDocID();
    const feedback: IFeedback = {
      rating: this.rating,
      timestamp: new Date().getTime(),
      itemID: this.dialogData.itemID,
      uid: this.dialogData.uid,
    }
    let reason: IFeedbackReason = null;
    if (selectedIssues.length && this.isShowIssues) {
      // save more
      reason = {
        reasons: this.allIssuesList.map(el => el.value)
      }
    }
    this.apiPostService.saveFeedback(this.dialogData.id, feedbackID, feedback, reason)
      .then(() => {
        this.isSubmitted = true;
      })
      .catch(() => {
        this.isSubmitted = false;
      })
      .finally(() => {
        this.isShowMoreIssues = false;
        this.isLoaderShown = false;
      })
  }

  selectIssue(issue: ISelection) {
    issue.selected = !issue.selected;
  }

  selectMoreIssue(issue: ListOption) {
    const foundIssue = this.allIssuesList.find(el => el.value === issue.value);
    if (foundIssue) {
      foundIssue.selected = !foundIssue.selected;
    }
  }

  openMoreIssues() {
    for (const key in this.reasons) {
      this.reasons[key].forEach(element => {
        this.allIssuesList.push({
          ...element,
          selected: false
        });
      });
    }
    this.copyFromHighlighted();
    this.isShowMoreIssues = true;
  }

  copyFromHighlighted() {
    this.highlights.forEach(element => {
      if (element.selected) {
        const el = this.allIssuesList.find(e => e.value === element.value);
        el.selected = element.selected;
      }
    });
  }

  get isShowIssues(): boolean {
    return this.rating <= 4 && this.rating > 0;
  }
}

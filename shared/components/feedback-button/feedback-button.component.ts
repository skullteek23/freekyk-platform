import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackComponent } from '@shared/dialogs/feedback/feedback.component';

@Component({
  selector: 'app-feedback-button',
  templateUrl: './feedback-button.component.html',
  styleUrls: ['./feedback-button.component.scss']
})
export class FeedbackButtonComponent implements OnInit {

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  openFeedback() {
    this.dialog.open(FeedbackComponent, {
      panelClass: 'fk-dialogs',
      disableClose: false,
      closeOnNavigation: true
    })
  }

}

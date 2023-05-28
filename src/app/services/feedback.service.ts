import { Injectable } from '@angular/core';
import { ApiGetService, ApiPostService } from '@shared/services/api.service';
import { AuthService } from './auth.service';
import { MatBottomSheet, MatBottomSheetConfig } from '@angular/material/bottom-sheet';
import { PaymentOptionsPickupGameComponent } from '@app/main-shell/components/payment-options-pickup-game/payment-options-pickup-game.component';
import { IPendingFeedback } from '@shared/interfaces/feedback.model';
import { FeedbackComponent } from '@app/main-shell/components/feedback/feedback.component';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(
    private apiGetService: ApiGetService,
    private authService: AuthService,
    private apiPostService: ApiPostService,
    private _bottomSheet: MatBottomSheet
  ) {
    this.getPendingFeedback();
  }

  getPendingFeedback() {
    this.authService.isLoggedIn().subscribe({
      next: (user) => {
        if (user) {
          this.apiGetService.getPendingFeedbacks(user.uid).subscribe({
            next: (response) => {
              if (response && response.length) {
                this.openFeedbackSheet(response[0]);
              }
            }
          });
        }

      }
    })
  }

  openFeedbackSheet(data: IPendingFeedback) {
    const options = new MatBottomSheetConfig();
    options.data = data;
    options.panelClass = 'feedback-mat-sheet'
    this._bottomSheet.open(FeedbackComponent, options).afterDismissed().toPromise();
  }
}

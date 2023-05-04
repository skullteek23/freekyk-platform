import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GenerateRewardService } from '@app/main-shell/services/generate-reward.service';
import { RewardService } from '@app/main-shell/services/reward.service';
import { AuthService, authUserMain } from '@app/services/auth.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { UNIVERSAL_OPTIONS } from '@shared/constants/RAZORPAY';
import { MatchConstants } from '@shared/constants/constants';
import { ICheckoutOptions, IItemType, RazorPayOrder } from '@shared/interfaces/order.model';
import { PaymentService } from '@shared/services/payment.service';
import { IEarnedRewardDialogData } from '../reward-earn-dialog/reward-earn-dialog.component';

@Component({
  selector: 'app-purchase-points',
  templateUrl: './purchase-points.component.html',
  styleUrls: ['./purchase-points.component.scss']
})
export class PurchasePointsComponent implements OnInit {

  readonly minVal = MatchConstants.MINIMUM_POINTS_RECHARGE;

  purchaseAmt = 0;
  quickAmountList = [100, 500, 1000, 2000];
  user: authUserMain = null;

  constructor(
    private authService: AuthService,
    private paymentService: PaymentService,
    private snackBarService: SnackbarService,
    private datePipe: DatePipe,
    private generateRewardService: GenerateRewardService,
    private router: Router,
    private rewardService: RewardService
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe({
      next: user => {
        if (user) {
          this.user = user;
        }
      }
    });
  }

  async addPoints() {
    if (this.purchaseAmt >= this.minVal && this.user) {
      this.showLoader();
      const order = await this.paymentService.getNewOrder(this.user.uid, this.purchaseAmt.toString());
      if (order) {
        const options: Partial<ICheckoutOptions> = {
          ...UNIVERSAL_OPTIONS,
          prefill: {
            contact: this.user.phoneNumber,
            name: this.user.displayName,
            email: this.user.email
          },
          description: `+${this.purchaseAmt} Points Purchase`,
          order_id: order.id,
          amount: this.purchaseAmt * 100,
          handler: this.success.bind(this),
          modal: {
            backdropclose: false,
            escape: false,
            confirm_close: true,
            ondismiss: this.dismissDialog.bind(this)
          }
        }
        this.paymentService.openCheckoutPage(options);
      }
    }
  }

  dismissDialog() {
    this.hideLoader();
  }

  success(response) {
    if (response) {
      this.showLoader();
      this.paymentService.verifyPayment(response).subscribe({
        next: (resp) => {
          if (resp) {
            Promise.all(this.getPromises(response))
              .then(() => {
                this.hideLoader();
                const data: IEarnedRewardDialogData = {
                  points: this.purchaseAmt,
                  activityID: null,
                  isAdded: true
                }
                this.generateRewardService.openRewardDialog(data);
                this.openOrder(response['razorpay_order_id']);
                this.resetAmt();
              })
              .catch((error) => {
                this.snackBarService.displayError(error?.message);
                this.hideLoader();
              })
          }
        },
        error: (error) => {
          this.dismissDialog();
          this.snackBarService.displayError(error?.message);
        }
      })
    } else {
      this.dismissDialog();
      this.snackBarService.displayError('Error: Payment Verification could not be initiated!');
    }
  }

  resetAmt() {
    this.purchaseAmt = 0;
  }

  openOrder(orderID: string) {
    if (orderID) {
      this.router.navigate(['/order', orderID])
    }
  }

  getPromises(response): any[] {
    const options: Partial<RazorPayOrder> = {
      notes: {
        itemID: null,
        itemName: `${this.purchaseAmt} Points Purchase`,
        itemQty: this.purchaseAmt,
        itemCancelledQty: 0,
        itemType: IItemType.pointsPurchase,
        logs: [
          `Added ${this.purchaseAmt} points on ${this.datePipe.transform(new Date(), 'short')}`
        ]
      }
    }

    const allPromises = [];
    const entity = 'by purchasing';
    allPromises.push(this.generateRewardService.addPoints(this.purchaseAmt, this.user.uid, entity))
    allPromises.push(this.paymentService.saveOrder(options, response).toPromise());

    return allPromises;
  }

  increment(incrementValue: number) {
    this.purchaseAmt += incrementValue;
  }

  showLoader() {
    this.rewardService.showLoader();
  }

  hideLoader() {
    this.rewardService.hideLoader();
  }

}

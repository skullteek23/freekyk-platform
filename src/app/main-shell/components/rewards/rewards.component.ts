import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { GenerateRewardService } from '@app/main-shell/services/generate-reward.service';
import { AuthService, authUserMain } from '@app/services/auth.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { UNIVERSAL_OPTIONS } from '@shared/constants/RAZORPAY';
import { MatchConstants } from '@shared/constants/constants';
import { FeatureInfoComponent, IFeatureInfoOptions } from '@shared/dialogs/feature-info/feature-info.component';
import { ICheckoutOptions, RazorPayOrder } from '@shared/interfaces/order.model';
import { ActivityListOption, IReward } from '@shared/interfaces/reward.model';
import { ApiGetService } from '@shared/services/api.service';
import { PaymentService } from '@shared/services/payment.service';
import { FREEKYK_REWARDS_DESCRIPTION } from '@shared/web-content/WEBSITE_CONTENT';

@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.scss'],
  providers: [DatePipe]
})
export class RewardsComponent implements OnInit {

  readonly minVal = MatchConstants.MINIMUM_POINTS_RECHARGE;

  userPoints = 0;
  isLoaderShown = false;
  activitiesList: ActivityListOption[] = [];
  rewardsList: IReward[] = [];
  purchaseAmt = 0;
  quickAmountList = [100, 500, 1000, 2000];
  user: authUserMain = null;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private apiGetService: ApiGetService,
    private router: Router,
    private paymentService: PaymentService,
    private snackBarService: SnackbarService,
    private datePipe: DatePipe,
    private generateRewardService: GenerateRewardService
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe({
      next: user => {
        if (user) {
          this.user = user;
          this.getUserPoints();
        }
      }
    })
  }

  getUserPoints() {
    this.showLoader();
    this.apiGetService.getUserPoints(this.user.uid).subscribe({
      next: response => {
        if (response?.points >= 0) {
          this.userPoints = response.points;
        }
        this.hideLoader();
      },
      error: () => {
        this.hideLoader();
      }
    })
  }

  openInfo() {
    const data: IFeatureInfoOptions = {
      heading: 'How Rewards Work?',
      multiDescription: [
        { subheading: 'Freekyk Rewards Program', description: FREEKYK_REWARDS_DESCRIPTION }
      ]
    }
    this.dialog.open(FeatureInfoComponent, {
      panelClass: 'fk-dialogs',
      data
    })
  }

  onChangeTab(change: MatTabChangeEvent) {
    switch (change.index) {
      case 1:
        this.getRewards();
        break;
    }
  }

  getRewards() {
    this.showLoader();
    this.apiGetService.getRewards().subscribe({
      next: (response) => {
        if (response) {
          response.map(el => {
            el.progress = 1 - ((this.userPoints / el.valuePoints) * 100);
          });
          this.rewardsList = response;
        }
        this.hideLoader();
      },
      error: () => {
        this.rewardsList = [];
        this.hideLoader();
      }
    })
  }

  openReward(reward: IReward) {
    console.log(reward);
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
                this.openOrder(response['razorpay_order_id']);
                this.resetAmt();
              })
              .catch((error) => {
                this.snackBarService.displayError(error?.message);
              })
              .finally(() => {
                this.dismissDialog();
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
        associatedEntityID: null,
        associatedEntityName: `${this.purchaseAmt} Points Purchase`,
        purchaseQty: this.purchaseAmt,
        cancelledQty: null,
        qtyEntityID: null,
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
    this.isLoaderShown = true;
  }

  hideLoader() {
    this.isLoaderShown = false;
  }
}

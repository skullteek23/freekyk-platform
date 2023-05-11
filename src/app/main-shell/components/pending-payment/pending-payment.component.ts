import { AuthService } from '@app/services/auth.service';
import { authUserMain } from '@shared/interfaces/user.model';
import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SnackbarService } from '@shared/services/snackbar.service';
import { ICheckoutOptions, IItemType, RazorPayOrder } from '@shared/interfaces/order.model';
import { ApiGetService } from '@shared/services/api.service';
import { PaymentService } from '@shared/services/payment.service';
import { Subscription } from 'rxjs';
import { UNIVERSAL_OPTIONS } from '@shared/constants/RAZORPAY';

@Component({
  selector: 'app-pending-payment',
  templateUrl: './pending-payment.component.html',
  styleUrls: ['./pending-payment.component.scss']
})
export class PendingPaymentComponent implements OnInit, OnDestroy {

  readonly type = IItemType;

  orders: Partial<RazorPayOrder>[] = [];
  subscriptions = new Subscription();
  isLoaderShown = false;
  user: authUserMain;

  constructor(
    private router: Router,
    private apiService: ApiGetService,
    private snackbarService: SnackbarService,
    private datePipe: DatePipe,
    private paymentService: PaymentService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe({
      next: (user) => {
        if (user?.uid) {
          this.user = user;
          this.getPendingOrders();
        } else {
          this.router.navigate(['/']);
        }
      }
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  goBack() {
    this.router.navigate(['/orders']);
  }

  getPendingOrders() {
    this.showLoader();
    this.apiService.getUserPendingOrders(this.user.uid)
      .subscribe({
        next: response => {
          if (response) {
            this.orders = response;
          } else {
            this.snackbarService.displayError('Error: Unable to get pending payments!');
          }
          this.hideLoader();
        },
        error: (error) => {
          this.snackbarService.displayError('Error: Unable to get pending payments!');
          this.hideLoader();
        }
      });
  }

  payNow(order: Partial<RazorPayOrder>) {
    if (order?.amount_due > 0 && this.user) {
      const checkoutOptions: Partial<ICheckoutOptions> = {
        ...UNIVERSAL_OPTIONS,
        prefill: {
          contact: this.user.phoneNumber,
          name: this.user.displayName,
          email: this.user.email
        },
        order_id: order.id,
        amount: order.amount_due * 100,
        handler: this.verifyPayment.bind(this, order),
        modal: {
          backdropclose: false,
          escape: false,
          confirm_close: true,
          ondismiss: this.dismiss.bind(this)
        },
      };
      this.paymentService.openCheckoutPage(checkoutOptions);
    }
  }

  async verifyPayment(order: Partial<RazorPayOrder>, response) {
    if (response) {
      this.showLoader();
      try {
        const verificationResult = await this.paymentService.verifyPayment(response).toPromise();
        if (verificationResult) {
          const logs = order.notes.logs;
          logs.push(`Paid partial amount on ${this.datePipe.transform(new Date(), 'short')}`);
          const update: Partial<RazorPayOrder> = {
            notes: {
              ...order.notes,
              logs
            }
          }
          const saveResult = await this.paymentService.updateOrder(update, order.id).toPromise();
          if (saveResult) {
            this.snackbarService.displayCustomMsg('Your partial payment is successful!');
            this.getPendingOrders();
            this.navigateOut();
            this.hideLoader();
          }
        }
      } catch (error) {
        this.hideLoader();
        this.snackbarService.displayError(error?.message);
      }
    }
  }

  navigateOut() {
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams?.hasOwnProperty('callback')) {
      const callbackUrl = decodeURIComponent(queryParams.callback);
      this.router.navigate([callbackUrl]);
    }
  }

  dismiss() {
    this.hideLoader();
  }

  showLoader() {
    this.isLoaderShown = true;
  }

  hideLoader() {
    this.isLoaderShown = false;
  }
}

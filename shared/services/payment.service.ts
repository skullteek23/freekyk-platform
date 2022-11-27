import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { T_HOME, T_LOADING, T_FAILURE, T_SUCCESS, HOME, } from '../../src/app/dashboard/constants/constants';
import { CLOUD_FUNCTIONS } from '@shared/Constants/CLOUD_FUNCTIONS';
import { UNIVERSAL_OPTIONS } from '@shared/Constants/RAZORPAY';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { share } from 'rxjs/operators';
declare let Razorpay: any;
export type PAYMENT_TYPE = T_HOME | T_LOADING | T_SUCCESS | T_FAILURE;

export interface IRazorPayOptions {
  key: string,
  currency: string,
  name: string,
  image: string,
  theme: {
    color: string,
  },
  retry: {
    max_count: number,
  },
  confirm_close: boolean,
  description: string;
  handler: () => Promise<any>;
  amount: number;
  order_id: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  private loadingStatusChanged = new BehaviorSubject<PAYMENT_TYPE>(HOME);
  private paymentStatusAdmin = new Subject<any>();

  constructor(
    private ngFunc: AngularFireFunctions,
    private router: Router
  ) { }

  generateOrder(amount: number): Promise<any> {
    // order generation can only be handled from backend, confirmed by razorpay team
    const generatorFunc = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.GENERATE_RAZORPAY_ORDER);
    return generatorFunc({ amount }).toPromise();
  }

  openCaptainCheckoutPage(orderId: string, season: SeasonBasicInfo, teamId: string): void {
    const fees = this.getFeesAfterDiscount(season.feesPerTeam, season.discount)?.toString();
    const options = {
      ...UNIVERSAL_OPTIONS,
      description: `Participation Fees`,
      handler: this.handleSuccess.bind(this, season, teamId),
      amount: fees,
      order_id: orderId,
    };
    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
    razorpayInstance.on('payment.failed', this.handleFailure.bind(this, '/dashboard/error'));
  }

  async openAdminCheckoutPage(orderId: string): Promise<any> {
    const options: IRazorPayOptions = {
      ...UNIVERSAL_OPTIONS,
      description: `Tournament Organizer Fees`,
      handler: this.handleAdminSuccess.bind(this),
      amount: 1000,
      order_id: orderId,
    };
    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
    razorpayInstance.on('payment.failed', this.handleFailure.bind(this, '/error'));
  }

  handleAdminSuccess(response) {
    if (response) {
      setTimeout(() => {
        this.paymentStatusAdmin.next({ ...response, status: true });
      }, 3000);
    }
  }

  handleSuccess(season, tid, response): void {
    this.onLoadingStatusChange('loading');
    const uid = localStorage.getItem('uid');
    const verifyPaymentFunc = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.VERIFY_PAYMENT);
    verifyPaymentFunc({ ...response, uid, season, tid })
      .toPromise()
      .then(() => this.onLoadingStatusChange('success'))
      .catch((err) => {
        this.onLoadingStatusChange('home');
        err == null
          ? this.handleFailure({
            description: 'Payment Failed! Unauthorized payment source.',
            code: '501',
          }, '/dashboard/error')
          : this.handleFailure({
            description: 'Payment Failed! Try again later',
            code: '401',
          }, '/dashboard/error');
      }
      );
  }

  handleFailure(error, route: string): void {
    alert(error.description);
    this.router.navigate([route], { state: { message: error.description, code: error.code } });
  }

  onLoadingStatusChange(status: PAYMENT_TYPE): void {
    this.loadingStatusChanged.next(status);
  }

  getLoadingStatus(): BehaviorSubject<PAYMENT_TYPE> {
    return this.loadingStatusChanged;
  }

  getFeesAfterDiscount(fees: number, discount: number): number {
    if (fees === 0) {
      return 1;
    }
    return (fees - ((discount / 100) * fees));
  }

  get _paymentStatusAdmin(): Subject<any> {
    return this.paymentStatusAdmin;
  }
}

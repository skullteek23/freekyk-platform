import { Inject, Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {
  T_HOME,
  T_LOADING,
  T_FAILURE,
  T_SUCCESS,
  HOME,
} from '../dashboard/constants/constants';
import { UNIVERSAL_OPTIONS, RazorPayAPI } from '../shared/Constants/RAZORPAY';
declare var Razorpay: any;
@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private loadingStatusChanged = new BehaviorSubject<
    T_HOME | T_LOADING | T_SUCCESS | T_FAILURE
  >(HOME);
  generateOrder(amount: number): Promise<any> {
    const generatorFunc = this.ngFunc.httpsCallable('generateRazorpayOrder');
    return generatorFunc({ amount }).toPromise();
  }
  openCheckoutPage(
    orderId: string,
    amount: number,
    season,
    teamId: string
  ): void {
    const options = {
      ...UNIVERSAL_OPTIONS,
      handler: this.redirectAfterPaymentSuccess.bind(this, season, teamId),
      amount: amount.toString(),
      order_id: orderId,
    };
    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
    razorpayInstance.on('payment.failed', this.redirectAfterPaymentFailure);
  }
  redirectAfterPaymentSuccess(season, tid, response): void {
    this.onLoadingStatusChange('loading');
    const uid = localStorage.getItem('uid');
    const verifyPaymentFunc = this.ngFunc.httpsCallable('verifyPayment');
    verifyPaymentFunc({ ...response, uid, season, tid })
      .toPromise()
      .then(() => this.onLoadingStatusChange('success'))
      .catch(() => this.onLoadingStatusChange('home'))
      .catch((err) =>
        err == null
          ? this.redirectAfterPaymentFailure({
              description: 'Payment Failed! Unauthorized payment source.',
              code: '501',
            })
          : this.redirectAfterPaymentFailure({
              description: 'Payment Failed! Try again later',
              code: '401',
            })
      );
  }
  redirectAfterPaymentFailure(error): void {
    this.onLoadingStatusChange('home');
    alert(error.description);
    this.router.navigate(['/dashboard/error'], {
      state: { message: error.description, code: error.code },
    });
  }
  onLoadingStatusChange(
    status: T_HOME | T_LOADING | T_SUCCESS | T_FAILURE
  ): void {
    this.loadingStatusChanged.next(status);
  }
  getLoadingStatus(): BehaviorSubject<
    T_HOME | T_LOADING | T_SUCCESS | T_FAILURE
  > {
    return this.loadingStatusChanged;
  }
  constructor(
    private ngFunc: AngularFireFunctions,
    private router: Router,
    @Inject(RazorPayAPI)
    public RAZORPAY_SECRET: { key_id: string; key_secret: string }
  ) {}
}

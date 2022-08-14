import { Inject, Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { T_HOME, T_LOADING, T_FAILURE, T_SUCCESS, HOME, } from '../dashboard/constants/constants';
import { CLOUD_FUNCTIONS } from '../shared/Constants/CLOUD_FUNCTIONS';
import { UNIVERSAL_OPTIONS, RazorPayAPI } from '../shared/Constants/RAZORPAY';
import { SeasonBasicInfo } from '../shared/interfaces/season.model';
declare var Razorpay: any;
export type PAYMENT_TYPE = T_HOME | T_LOADING | T_SUCCESS | T_FAILURE;

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private loadingStatusChanged = new BehaviorSubject<PAYMENT_TYPE>(HOME);
  generateOrder(amount: number): Promise<any> {
    // order generation can only be handled from backend, confirmed by razorpay team
    const generatorFunc = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.GENERATE_RAZORPAY_ORDER);
    return generatorFunc({ amount }).toPromise();
  }
  openCheckoutPage(orderId: string, season: SeasonBasicInfo, teamId: string): void {
    const options = {
      ...UNIVERSAL_OPTIONS,
      description: `Participation Fees`,
      handler: this.redirectAfterPaymentSuccess.bind(this, season, teamId),
      amount: season.feesPerTeam.toString(),
      order_id: orderId,
    };
    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
    razorpayInstance.on('payment.failed', this.redirectAfterPaymentFailure);
  }
  redirectAfterPaymentSuccess(season, tid, response): void {
    this.onLoadingStatusChange('loading');
    const uid = localStorage.getItem('uid');
    const verifyPaymentFunc = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.VERIFY_PAYMENT);
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
  onLoadingStatusChange(status: PAYMENT_TYPE): void {
    this.loadingStatusChanged.next(status);
  }
  getLoadingStatus(): BehaviorSubject<PAYMENT_TYPE> {
    return this.loadingStatusChanged;
  }
  constructor(
    private ngFunc: AngularFireFunctions,
    private router: Router,
    @Inject(RazorPayAPI) public RAZORPAY_SECRET: { key_id: string; key_secret: string }
  ) { }
}

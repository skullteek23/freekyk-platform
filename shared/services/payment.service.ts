import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { CLOUD_FUNCTIONS } from '@shared/constants/CLOUD_FUNCTIONS';
import { ICheckoutOptions, RazorPayOrder } from '@shared/interfaces/order.model';
import { FunctionsApiService } from './functions-api.service';
import { SeasonAllInfo } from '@shared/utils/pipe-functions';
import { GenerateRewardService } from '@app/main-shell/services/generate-reward.service';
import { ApiGetService, ApiPostService } from './api.service';
import { authUserMain } from '@shared/interfaces/user.model';
declare var Razorpay: any;

@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  constructor(
    private ngFunc: AngularFireFunctions,
    private functionsApiService: FunctionsApiService,
    private generateRewardService: GenerateRewardService,
    private apiPostService: ApiPostService,
    private apiGetService: ApiGetService
  ) { }

  async generateOrder(amount: number, minAmount: number): Promise<any> {
    if (!amount || amount <= 0) {
      return Promise.reject('Error occurred! Amount is very low');
    }

    const uid = localStorage.getItem('uid');
    const data: any = {};
    data['amount'] = amount;
    data['uid'] = uid;
    data['minimumPartial'] = minAmount;

    // order generation can only be handled from backend, confirmed by razorpay team
    const generatorFunc = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.GENERATE_RAZORPAY_ORDER);
    return await generatorFunc(data).toPromise();
  }

  openCheckoutPage(options: Partial<ICheckoutOptions>): void {
    if (!options || Object.keys(options).length === 0) {
      return;
    }
    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
    razorpayInstance.on('payment.failed', this.handleFailure.bind(this));

  }

  handleFailure(response): void {
    console.log(response.error.description);
  }

  verifyPayment(response): Observable<any> {
    const verifyPaymentFunc = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.VERIFY_PAYMENT);
    return verifyPaymentFunc({ ...response });
  }

  participate(season: Partial<SeasonAllInfo>, participantId: string) {
    const participateFunc = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.SEASON_PARTICIPATION);
    return participateFunc({ season, participantId });
  }

  saveOrder(options: Partial<RazorPayOrder>, response: any) {
    const participateFunc = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.SAVE_RAZORPAY_ORDER);
    return participateFunc({ options, response });
  }

  savePointsOrder(orderID: string, order: Partial<RazorPayOrder>) {
    return this.apiPostService.saveOrder(orderID, order);
  }

  updateOrder(options: Partial<RazorPayOrder>, orderID: string) {
    const participateFunc = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.UPDATE_RAZORPAY_ORDER);
    return participateFunc({ options, orderID });
  }

  getFeesAfterDiscount(fees: number, discount: number): number {
    if (fees === 0) {
      return 0;
    }
    return (fees - ((discount / 100) * fees));
  }

  getOrder(seasonID: string, uid: string): Promise<Partial<RazorPayOrder>> {
    const data = { uid, seasonID };
    return this.functionsApiService.generateOrder(data);
  }

  getNewOrder(uid: string, fees: string, partialAmt?: string): Promise<Partial<RazorPayOrder>> {
    const data = { uid, fees, partialAmt };
    return this.functionsApiService.generateNewOrder(data);
  }

  initOrderRefund(order: Partial<RazorPayOrder>, refundAmt: number) {
    if (order?.id && refundAmt) {
      const myFunc = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.REFUND_RAZORPAY_ORDER);
      return myFunc({ paymentID: order?.razorpay_payment_id, refundAmt }).toPromise();
    }
  }

  payWithPoints(user: authUserMain, amount: number) {
    return this.generateRewardService.subtractPoints(amount, user.uid, 'booking pickup game slots(s)');
  }

  isPendingOrder(userID: string): Promise<boolean> {
    return this.apiGetService.isPendingOrder(userID).toPromise();
  }


  // handlePartialPaymentSuccess(response) {
  //   this.verifyPayment(response)
  //     .subscribe({
  //       next: () => {
  //         this.updateOrder(response).toPromise()
  //           .then(() => {
  //             this.snackBarService.displayCustomMsg('Your payment is completed!');
  //           })
  //           .catch((error) => {
  //             this.snackBarService.displayError(error.message);
  //           })
  //       },
  //       error: (error) => {
  //         this.snackBarService.displayError(error?.message);
  //       }
  //     });
  // }
}

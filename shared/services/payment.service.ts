import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { CLOUD_FUNCTIONS } from '@shared/Constants/CLOUD_FUNCTIONS';
import { OrderTypes, RazorPayOrder } from '@shared/interfaces/order.model';
import { Router } from '@angular/router';
import { FunctionsApiService } from './functions-api.service';
import { UNIVERSAL_OPTIONS } from '@shared/Constants/RAZORPAY';
import { SnackbarService } from '@app/services/snackbar.service';
import { SeasonAllInfo } from '@shared/utils/pipe-functions';
declare let Razorpay: any;

export enum LoadingStatus {
  default = 0,
  loading = 1,
  success = 2,
  failed = 3,
}

export interface ICheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  order_id: string;
  handler: () => Promise<any>;
  description?: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    method?: string;
  },
  notes?: any;
  theme?: {
    hide_topbar?: boolean;
    color?: string;
    backdrop_color?: string;
  };
  modal?: {
    backdropclose?: boolean;
    escape?: boolean;
    handleback?: boolean;
    confirm_close?: boolean;
    ondismiss?: () => {};
    animation?: boolean;
  };
  customer_id?: string;
  timeout?: number;
  remember_customer?: boolean;
  send_sms_hash?: boolean;
  allow_rotation?: boolean;
  retry?: {
    enabled?: boolean;
  };
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  constructor(
    private ngFunc: AngularFireFunctions,
    private functionsApiService: FunctionsApiService,

    private router: Router
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

  saveOrder(season: Partial<SeasonAllInfo>, orderType: OrderTypes, response: any) {
    const participateFunc = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.SAVE_RAZORPAY_ORDER);
    return participateFunc({ seasonID: season.id, seasonName: season.name, orderType, response });
  }

  updateOrder(response: any) {
    const participateFunc = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.UPDATE_RAZORPAY_ORDER);
    return participateFunc({ response });
  }

  getFeesAfterDiscount(fees: number, discount: number): number {
    if (fees === 0) {
      return 0;
    }
    return (fees - ((discount / 100) * fees));
  }

  async getOrder(season: Partial<SeasonAllInfo>, uid: string): Promise<Partial<RazorPayOrder>> {
    const data = { uid, season };
    return this.functionsApiService.generateOrder(data);
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

import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { CLOUD_FUNCTIONS } from '@shared/Constants/CLOUD_FUNCTIONS';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { OrderTypes } from '@shared/interfaces/order.model';
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

  participate(season: SeasonBasicInfo, participantId: string) {
    const participateFunc = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.SEASON_PARTICIPATION);
    return participateFunc({ season, participantId });
  }

  saveOrder(season: SeasonBasicInfo, orderType: OrderTypes, response: any) {
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
}

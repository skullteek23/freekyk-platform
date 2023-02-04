import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { BehaviorSubject, Observable } from 'rxjs';
import { T_HOME, T_LOADING, T_FAILURE, T_SUCCESS, HOME, } from '../../src/app/dashboard/constants/constants';
import { CLOUD_FUNCTIONS } from '@shared/Constants/CLOUD_FUNCTIONS';
import { UNIVERSAL_OPTIONS } from '@shared/Constants/RAZORPAY';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { OrderTypes, userOrder } from '@shared/interfaces/order.model';
import { ngfactoryFilePath } from '@angular/compiler/src/aot/util';
import { AngularFirestore } from '@angular/fire/firestore';
declare let Razorpay: any;
export type PAYMENT_TYPE = T_HOME | T_LOADING | T_SUCCESS | T_FAILURE;

export enum LoadingStatus {
  default = 0,
  loading = 1,
  success = 2,
  failed = 3,
}

export interface ICheckoutOptions {
  key?: string,
  currency?: string,
  name?: string,
  image?: string,
  theme?: {
    color?: string,
  },
  retry?: {
    max_count: number,
  },
  confirm_close?: boolean,
  description?: string;
  handler?: () => Promise<any>;
  amount?: number;
  order_id?: string;
  failureRoute?: string;
  modal?: {
    ondismiss: () => void
  }
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  private loadingStatusChanged = new BehaviorSubject<PAYMENT_TYPE>(HOME);

  constructor(
    private ngFunc: AngularFireFunctions,
    private ngFire: AngularFirestore
  ) { }

  generateOrder(amount: number, partialAmount: number): Promise<any> {
    if (!amount || amount <= 0) {
      return Promise.reject('Error occurred! Amount is very low');
    }

    const uid = localStorage.getItem('uid');
    const data: any = {};
    data.amount = amount;
    data.uid = uid;

    if (partialAmount && partialAmount > 0) {
      data.amountPartial = Number(partialAmount);
    }

    // order generation can only be handled from backend, confirmed by razorpay team
    const generatorFunc = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.GENERATE_RAZORPAY_ORDER);
    return generatorFunc(data).toPromise();
  }

  openCheckoutPage(options: ICheckoutOptions): void {
    if (!options || Object.keys(options).length === 0) {
      return;
    }
    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
    razorpayInstance.on('payment.failed', this.handleFailure.bind(this));
  }

  handleFailure(response): void {
    alert(response.error.description);
  }

  verifyPayment(response): Observable<any> {
    const verifyPaymentFunc = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.VERIFY_PAYMENT);
    return verifyPaymentFunc({ ...response });
  }

  getCaptainCheckoutOptions(fees: string): ICheckoutOptions {
    const options = {
      ...UNIVERSAL_OPTIONS,
      description: `Participation Fees`,
      amount: Number(fees)
    };
    return options;
  }

  onSuccessPlayer(season: SeasonBasicInfo, tid: string, response: any): void {
    this.onLoadingStatusChange('loading');
    if (season && tid && response) {
      this.verifyPayment(response).subscribe({
        next: (status) => {
          if (status) {
            this.participate(season, tid)
              .subscribe({
                next: (response) => {
                  this.onLoadingStatusChange('success');
                },
                error: (err) => {
                  this.onLoadingStatusChange('home');
                }
              });
          } else {
            this.onLoadingStatusChange('home');
          }
        },
        error: (err) => {
          this.onLoadingStatusChange('home');
        }
      })
    } else {
      this.loadingStatusChanged.next('home')
    }
  }

  participate(season: SeasonBasicInfo, participantId: string) {
    const participateFunc = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.SEASON_PARTICIPATION);
    return participateFunc({ season, participantId });
  }

  saveOrder(season: SeasonBasicInfo, due: number, type: OrderTypes, response: any) {
    const uid = localStorage.getItem('uid');
    const payableFees = this.getFeesAfterDiscount(season.feesPerTeam, season.discount)
    if (uid && season.id && payableFees > 0) {
      const order: userOrder = {
        by: uid,
        amount: payableFees,
        amountDue: due,
        razorpay_order_id: response['razorpay_order_id'],
        razorpay_payment_id: response['razorpay_payment_id'],
        razorpay_signature: response['razorpay_signature'],
        date: new Date().getTime(),
        type,
        refId: season.id
      }
      return this.ngFire.collection('orders').doc(order.razorpay_order_id).set(order);
    }
  }

  onLoadingStatusChange(status: PAYMENT_TYPE): void {
    this.loadingStatusChanged.next(status);
  }

  getLoadingStatus(): BehaviorSubject<PAYMENT_TYPE> {
    return this.loadingStatusChanged;
  }

  getFeesAfterDiscount(fees: number, discount: number): number {
    if (fees === 0) {
      return 0;
    }
    return (fees - ((discount / 100) * fees));
  }
}

import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { BehaviorSubject, Observable } from 'rxjs';
import { T_HOME, T_LOADING, T_FAILURE, T_SUCCESS, HOME, } from '../../src/app/dashboard/constants/constants';
import { CLOUD_FUNCTIONS } from '@shared/Constants/CLOUD_FUNCTIONS';
import { UNIVERSAL_OPTIONS } from '@shared/Constants/RAZORPAY';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
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
  ) { }

  generateOrder(finalAmount: string): Promise<any> {
    const amount = Number(finalAmount);
    if (amount === 0) {
      return Promise.reject();
    }
    // order generation can only be handled from backend, confirmed by razorpay team
    const generatorFunc = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.GENERATE_RAZORPAY_ORDER);
    return generatorFunc({ amount }).toPromise();
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

  getCaptainCheckoutOptions(fees: string, season: SeasonBasicInfo, teamID: string): ICheckoutOptions {
    const options = {
      ...UNIVERSAL_OPTIONS,
      description: `Participation Fees`,
      handler: this.onSuccessPlayer.bind(this, season, teamID),
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
            this.initParticipation(season, tid, response)
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

  initParticipation(season: SeasonBasicInfo, tid: string, response: any) {
    const uid = localStorage.getItem('uid');
    const participateFunc = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.SEASON_PARTICIPATION);
    return participateFunc({ ...response, season, tid, uid });
  }

  onLoadingStatusChange(status: PAYMENT_TYPE): void {
    this.loadingStatusChanged.next(status);
  }

  getLoadingStatus(): BehaviorSubject<PAYMENT_TYPE> {
    return this.loadingStatusChanged;
  }

  getFeesAfterDiscount(fees: number, discount: number): string {
    if (fees === 0) {
      return '0';
    }
    return (fees - ((discount / 100) * fees)).toString();
  }
}

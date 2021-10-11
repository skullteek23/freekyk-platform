import { Inject, Injectable } from '@angular/core';
import { RazorPayAPI } from '../shared/Constants/RAZORPAY';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  onInitiatePayment(): void {
    console.log('razorpay');
  }
  constructor(
    @Inject(RazorPayAPI)
    public RAZORPAY_SECRET: { key_id: string; key_secret: string }
  ) {}
}

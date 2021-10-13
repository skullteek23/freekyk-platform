import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CREATE_ORDER_API, RazorPayAPI } from '../shared/Constants/RAZORPAY';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  onInitiatePayment(): void {}
  createOrderFromServer(): void {
    const receiptId = Math.floor(Math.random() * 100000);
    const reqHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${btoa(
        `${this.RAZORPAY_SECRET.key_id}:${this.RAZORPAY_SECRET.key_secret}`
      )}`,
    });
    this.http
      .post(
        CREATE_ORDER_API,
        {
          amount: 3000,
          currency: 'INR',
          receipt: `order_rcptid_${receiptId}`,
        },
        {
          headers: reqHeaders,
        }
      )
      .subscribe((res) => console.log(res));
  }
  constructor(
    private http: HttpClient,
    @Inject(RazorPayAPI)
    public RAZORPAY_SECRET: { key_id: string; key_secret: string }
  ) {
    this.createOrderFromServer();
  }
}

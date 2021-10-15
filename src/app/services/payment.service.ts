import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { map, tap } from 'rxjs/operators';
import { CLOUD_FUNCTIONS } from '../shared/Constants/CLOUD_FUNCTIONS';
import { CREATE_ORDER_API, RazorPayAPI } from '../shared/Constants/RAZORPAY';

declare var Razorpay: any;
@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  onInitiatePayment(options: { amount: string; receiptId: string }): void {
    this.callCloudFunctionForOrderId(options.amount, options.receiptId).then(
      (response) => {
        console.log(response);
        this.openCheckoutPage(response.id);
      }
    );
  }
  callCloudFunctionForOrderId(amount: string, receiptId: string): Promise<any> {
    const options = {
      amount, // amount in the smallest currency unit
      currency: 'INR',
      receipt: receiptId,
    };
    const orderCallable = this.ngFunc.httpsCallable(
      CLOUD_FUNCTIONS.CREATE_RAZORPAY_ORDER
    );
    return orderCallable({ options, useLive: false })
      .pipe(tap((resp) => console.log(resp)))
      .toPromise();
  }
  openCheckoutPage(orderId: string): void {
    const options = {
      key: this.RAZORPAY_SECRET.key_id, // Enter the Key ID generated from the Dashboard
      amount: '50000', // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: 'INR',
      name: 'Acme Corp',
      description: 'Test Transaction',
      image: 'https://example.com/your_logo',
      order_id: 'order_9A33XWu170gUtm', // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      handler: this.redirectAfterPayment,
      prefill: {
        name: 'Gaurav Kumar',
        email: 'gaurav.kumar@example.com',
        contact: '9999999999',
      },
      notes: {
        address: 'Razorpay Corporate Office',
      },
      theme: {
        color: '#00810f',
      },
    };
    const rzp1 = new Razorpay(options);
  }
  redirectAfterPayment(response): void {
    console.log(response);
  }
  constructor(
    private http: HttpClient,
    private ngFunc: AngularFireFunctions,
    @Inject(RazorPayAPI)
    public RAZORPAY_SECRET: { key_id: string; key_secret: string }
  ) {}
}

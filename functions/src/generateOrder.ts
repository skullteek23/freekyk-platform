import { environment } from '../../environments/environment';
import * as functions from 'firebase-functions';

const Razorpay = require('razorpay');

export async function generateOrder(data: any, context: any): Promise<any> {
  const options: any = {
    currency: 'INR',
    partial_payment: true,
    amount: Number(data.amount) * 100, // amount in paise
    first_payment_min_amount: Number(data.minimumPartial) * 100,
    receipt: data.uid
  };

  const instanceOptions = {
    key_id: environment.razorPay.key_id,
    key_secret: environment.razorPay.key_secret,
  }
  try {
    const instance = new Razorpay(instanceOptions);
    return instance.orders.create(options);
  } catch (error) {
    throw new functions.https.HttpsError('unauthenticated', 'Error saving Order details!');
  }

}

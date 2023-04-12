import { environment } from '../../environments/environment';
import * as functions from 'firebase-functions';
import { MINIMUM_PAYMENT_AMOUNT } from './utils/utilities';

const Razorpay = require('razorpay');

export async function generateOrder(data: { uid: string, fees: string }, context: any): Promise<any> {
  if (!data?.uid || !data?.fees) {
    throw new functions.https.HttpsError('invalid-argument', 'Error Occurred! Please try again');
  }

  const fees = data.fees;
  const options: any = {
    currency: 'INR',
    partial_payment: true,
    amount: Number(fees) * 100, // amount in paise
    first_payment_min_amount: MINIMUM_PAYMENT_AMOUNT * 100,
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
    throw new functions.https.HttpsError('unauthenticated', 'Error generating details!');
  }
}

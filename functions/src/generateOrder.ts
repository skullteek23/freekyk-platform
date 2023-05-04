import { environment } from '../../environments/environment';
import * as functions from 'firebase-functions';

const Razorpay = require('razorpay');

export async function generateOrder(data: { uid: string, fees: string, partialAmt: string }, context: any): Promise<any> {
  if (!data?.uid || !data?.fees) {
    throw new functions.https.HttpsError('invalid-argument', 'Error Occurred! Please try again');
  }

  const fees = data.fees;
  const options: any = {
    currency: 'INR',
    amount: Number(fees) * 100, // amount in paise
    receipt: data.uid
  };

  if (data.hasOwnProperty('partialAmt') && Number(data.partialAmt) > 0) {
    options['partial_payment'] = true;
    options['first_payment_min_amount'] = Number(data.partialAmt) * 100;
  }

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

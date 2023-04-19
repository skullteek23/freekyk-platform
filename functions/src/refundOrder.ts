import { environment } from '../../environments/environment';
import * as functions from 'firebase-functions';

const Razorpay = require('razorpay');

export async function initRefundOrder(data: { paymentID: string, refundAmt: string }, context: any): Promise<any> {
  if (!data?.paymentID || !data?.refundAmt) {
    throw new functions.https.HttpsError('invalid-argument', 'Error Occurred! Please try again');
  }

  const refund = data.refundAmt;
  const instanceOptions = {
    key_id: environment.razorPay.key_id,
    key_secret: environment.razorPay.key_secret,
  }
  try {
    const instance = new Razorpay(instanceOptions);
    return instance.payments.refund(data?.paymentID, { amount: Number(refund) * 100 });
  } catch (error) {
    throw new functions.https.HttpsError('unauthenticated', 'Error generating details!');
  }
}

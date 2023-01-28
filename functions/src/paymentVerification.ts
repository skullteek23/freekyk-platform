import * as functions from 'firebase-functions';
import { environment } from '../../environments/environment';

const crypto = require('crypto');

export async function paymentVerification(data: any, context: any): Promise<any> {

  const ORDER_ID = data && data.razorpay_order_id ? data.razorpay_order_id : null;
  const PAYMENT_ID = data && data.razorpay_payment_id ? data.razorpay_payment_id : null;
  const SIGNATURE = data && data.razorpay_signature ? data.razorpay_signature : null;
  const KEY_SECRET = environment.razorPay.key_secret;
  const generatedSignature = crypto.createHmac('sha256', KEY_SECRET).update(`${ORDER_ID}|${PAYMENT_ID}`).digest('hex');

  if (ORDER_ID && PAYMENT_ID && SIGNATURE && generatedSignature && SIGNATURE === generatedSignature) {
    return true;
  } else {
    throw new functions.https.HttpsError('unauthenticated', 'Payment Authentication failed!');
  }
}

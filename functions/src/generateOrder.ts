import { environment } from '../../environments/environment';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { MINIMUM_PAYMENT_AMOUNT } from './utils/utilities';
import { RazorPayOrder } from '@shared/interfaces/order.model';
import { ISeason } from '@shared/interfaces/season.model';

const Razorpay = require('razorpay');
const db = admin.firestore();

export async function fetchOrder(data: { uid: string, seasonID: string }, context: any): Promise<any> {
  if (!data?.uid || !data?.seasonID) {
    throw new functions.https.HttpsError('invalid-argument', 'Error Occurred! Please try again');
  }

  const ordersList = (await db.collection('orders').where('receipt', '==', data?.uid).where('seasonID', '==', data?.seasonID).get()).docs.map(el => el.data() as Partial<RazorPayOrder>);
  if (ordersList.length) {
    return ordersList[0];
  } else {
    const fees = ((await db.collection('seasons').doc(data.seasonID).get()).data() as ISeason).fees;
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
}

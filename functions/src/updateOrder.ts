import { RazorPayOrder } from '@shared/interfaces/order.model';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { environment } from '../../environments/environment';
const db = admin.firestore();
const Razorpay = require('razorpay');

export async function updateRazorpayOrder(data: { response: any }, context: any): Promise<any> {

  const ORDER_ID = data?.response?.razorpay_order_id || null;
  const KEY_SECRET = environment.razorPay.key_secret;
  const KEY_ID = environment.razorPay.key_id;
  try {
    var instance = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET })
    const order: Partial<RazorPayOrder> = await instance?.orders?.fetch(ORDER_ID);
    if (order && ORDER_ID) {
      const update: Partial<RazorPayOrder> = {};
      update.amount_due = order.amount_due
      update.amount_paid = order.amount_paid;
      return db.collection('orders').doc(ORDER_ID).update({ ...update });
    }
    return false;
  } catch (error) {
    throw new functions.https.HttpsError('unauthenticated', 'Error saving Order details!');
  }
}

import { RazorPayOrder } from '@shared/interfaces/order.model';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { environment } from '../../environments/environment';
import { ISeason } from '@shared/interfaces/season.model';
const db = admin.firestore();
const Razorpay = require('razorpay');

export async function saveRazorpayOrder(data: { seasonID: string, orderType: number, options: Partial<RazorPayOrder>, response: any }, context: any): Promise<any> {

  const ORDER_ID = data?.response?.razorpay_order_id || null;
  const PAYMENT_ID = data?.response?.razorpay_payment_id || null;
  const options = data?.options || null;
  const KEY_SECRET = environment.razorPay.key_secret;
  const KEY_ID = environment.razorPay.key_id;
  try {
    var instance = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET })
    let order: Partial<RazorPayOrder> = await instance?.orders?.fetch(ORDER_ID);
    const seasonName = ((await db.collection('seasons').doc(data.seasonID).get()).data() as ISeason).name;
    if (order && ORDER_ID && PAYMENT_ID) {
      order['razorpay_payment_id'] = PAYMENT_ID;
      order.seasonID = data?.seasonID;
      order.seasonName = seasonName;
      order = {
        ...order,
        ...options
      }
      return db.collection('orders').doc(ORDER_ID).set(order);
    }
    return false;
  } catch (error) {
    throw new functions.https.HttpsError('unauthenticated', 'Error saving Order details!');
  }
}

import { RazorPayOrder } from '@shared/interfaces/order.model';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { environment } from '../../environments/environment';
const db = admin.firestore();
const Razorpay = require('razorpay');

export async function updateRazorpayOrder(data: { options: Partial<RazorPayOrder>, orderID: any }, context: any): Promise<any> {

  const ORDER_ID = data?.orderID;
  const KEY_SECRET = environment.razorPay.key_secret;
  const KEY_ID = environment.razorPay.key_id;
  if (!ORDER_ID) {
    throw new functions.https.HttpsError('unauthenticated', 'Error saving Order details!');
  }
  try {
    var instance = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET })
    const order: Partial<RazorPayOrder> = await instance?.orders?.fetch(ORDER_ID);
    if (order) {
      return db.collection('orders').doc(ORDER_ID).update({
        ...order,
        ...data.options
      });
    }
    return false;
  } catch (error) {
    throw new functions.https.HttpsError('unauthenticated', 'Error saving Order details!');
  }
}

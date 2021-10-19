import { OrderBasic } from '../../../src/app/shared/interfaces/order.model';
import * as admin from 'firebase-admin';
import {
  RAZORPAY_API_KEYˍID_TEST,
  RAZORPAY_API_KEYˍSECRET_TEST,
} from '../constants';
const db = admin.firestore();
const Razorpay = require('razorpay');
export async function orderCreationTrigger(
  snap: any,
  context: any
): Promise<any> {
  const snapData = snap.data() as OrderBasic;
  const snapId = snap.id;
  const instance = new Razorpay({
    key_id: RAZORPAY_API_KEYˍID_TEST,
    key_secret: RAZORPAY_API_KEYˍSECRET_TEST,
  });
  const options = {
    amount: snapData.payableTotal * 100, // amount in paise
    currency: 'INR',
  };
  const instanceSnap = await instance.orders.create(options);
  return db.collection('seasonOrders').doc(snapId).update({
    razorpay_order_id: instanceSnap.id,
  });
}

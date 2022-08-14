import * as admin from 'firebase-admin';
import { OrderBasic } from '../../src/app/shared/interfaces/order.model';
import { SeasonBasicInfo, SeasonParticipants, } from '../../src/app/shared/interfaces/season.model';
import { TeamBasicInfo } from '../../src/app/shared/interfaces/team.model';
import { environment } from '../../src/environments/environment.dev';
// import { environment } from '../../src/environments/environment.prod';
const crypto = require('crypto');
const db = admin.firestore();

export async function paymentVerification(data: any, context: any): Promise<any> {
  try {
    const KEY_SECRET = environment.razorPay.key_secret;
    const generatedSignature = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(data.razorpay_order_id + '|' + data.razorpay_payment_id)
      .digest('hex');
    const season = data.season as SeasonBasicInfo;
    const newOrder: OrderBasic = {
      razorpay_order_id: data.razorpay_order_id,
      razorpay_payment_id: data.razorpay_payment_id,
      razorpay_signature: data.razorpay_signature,
      status: 'SUCCESS',
      by: data.uid,
      payableTotal: season.feesPerTeam || 1,
      placedOn: admin.firestore.Timestamp.fromDate(new Date()),
      itemsDescSnap: {
        prodName: season.name,
        prodImgpath: season.imgpath,
        prodPrice: season.feesPerTeam ? season.feesPerTeam.toString() : '0',
        prodId: season.id || 'id',
        prodType: 'season',
      },
    };
    if (generatedSignature === data.razorpay_signature) {
      const teamSnap = await ((await db.collection('teams').doc(data.tid).get()).data() as TeamBasicInfo);
      if (!teamSnap) {
        return Promise.reject(null);
      }
      const newParticipant: SeasonParticipants = {
        tid: data.tid,
        tname: teamSnap.tname,
        tlogo: teamSnap.imgpath_logo,
      };
      const orderSnap = await db.collection('seasonOrders').doc(data.razorpay_order_id).set(newOrder);
      const seasonSnap = await db.collection('seasons').doc(season.id || 'id').collection('participants').add(newParticipant);

      if (seasonSnap && orderSnap) {
        return Promise.resolve(0);
      }
    } else {
      return Promise.reject(null);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

import * as admin from 'firebase-admin';
import { OrderBasic } from '../../src/app/shared/interfaces/order.model';
import { SeasonBasicInfo, SeasonParticipants, } from '../../src/app/shared/interfaces/season.model';
import { TeamBasicInfo } from '../../src/app/shared/interfaces/team.model';
import { assignSeasonParticipants } from './utils/utilities';
import { environment } from './utils/environments/environment';

const crypto = require('crypto');
const db = admin.firestore();

export async function paymentVerification(data: any, context: any): Promise<any> {

  const ORDER_ID = data && data.razorpay_order_id ? data.razorpay_order_id : null;
  const PAYMENT_ID = data && data.razorpay_payment_id ? data.razorpay_payment_id : null;
  const SIGNATURE = data && data.razorpay_signature ? data.razorpay_signature : null;
  const KEY_SECRET = environment.razorPay.key_secret;
  const season = data && data.season ? (data.season as SeasonBasicInfo) : null;
  const teamID = data && data.tid ? data.tid : null;
  const allPromises: any[] = [];
  let generatedSignature = null;
  let newOrder: OrderBasic;
  let teamInfo: TeamBasicInfo;
  let participantDetail: SeasonParticipants;

  if (ORDER_ID && PAYMENT_ID && season) {
    generatedSignature = crypto.createHmac('sha256', KEY_SECRET).update(`${ORDER_ID}|${PAYMENT_ID}`).digest('hex');
    newOrder = {
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
    if (teamID && newOrder && SIGNATURE && generatedSignature && SIGNATURE === generatedSignature) {
      teamInfo = (await db.collection('teams').doc(teamID).get()).data() as TeamBasicInfo;
      participantDetail = {
        tid: data.tid,
        tname: teamInfo.tname,
        tlogo: teamInfo.imgpath_logo,
      }
      allPromises.push(db.collection('seasonOrders').doc(data.razorpay_order_id).set(newOrder));
      allPromises.push(assignSeasonParticipants(season, participantDetail))
    }
  }
  return Promise.all(allPromises);
}

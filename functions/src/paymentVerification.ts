import * as admin from 'firebase-admin';
import { OrderBasic } from '../../src/app/shared/interfaces/order.model';
import { SeasonBasicInfo, SeasonParticipants, } from '../../src/app/shared/interfaces/season.model';
import { TeamBasicInfo } from '../../src/app/shared/interfaces/team.model';
import { sortObjectByKey } from './utils/utilities';
import { environment } from '../../src/environments/environment';
import { MatchFixture } from '../../src/app/shared/interfaces/match.model';

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

  if (!ORDER_ID || !PAYMENT_ID || !season) {
    return false;
  }

  generatedSignature = crypto.createHmac('sha256', KEY_SECRET).update(`${ORDER_ID}|${PAYMENT_ID}`).digest('hex');
  newOrder = {
    razorpay_order_id: data.razorpay_order_id,
    razorpay_payment_id: data.razorpay_payment_id,
    razorpay_signature: data.razorpay_signature,
    status: 'SUCCESS',
    by: data.uid,
    payableTotal: season.feesPerTeam || 1,
    placedOn: admin.firestore.Timestamp.now().toMillis(),
    itemsDescSnap: {
      prodName: season.name,
      prodImgpath: season.imgpath,
      prodPrice: season.feesPerTeam ? season.feesPerTeam.toString() : '0',
      prodId: season.id || 'id',
      prodType: 'season',
    },
  };

  if (!teamID || !newOrder || !SIGNATURE || !generatedSignature || SIGNATURE !== generatedSignature) {
    return false;
  }

  teamInfo = (await db.collection('teams').doc(teamID).get()).data() as TeamBasicInfo;
  participantDetail = {
    tid: data.tid,
    name: teamInfo.tname,
    logo: teamInfo.imgpath_logo,
  }
  allPromises.push(db.collection('seasonOrders').doc(data.razorpay_order_id).set(newOrder));
  allPromises.push(assignSeasonParticipants(season, participantDetail));

  if (!allPromises.length) {
    return false;
  }

  return Promise.all(allPromises);
}

export async function assignSeasonParticipants(season: SeasonBasicInfo, participant: SeasonParticipants): Promise<any> {
  const sid = season.id || '';
  const seasonName = season.name || '';
  const seasonFixturesData = (await db.collection('allMatches').where('season', '==', seasonName).get()).docs;

  const fixtures: any[] = [];
  const selectedFixtures: MatchFixture[] = [];
  const value = {
    name: participant.name,
    logo: participant.logo
  }
  const allPromises: any[] = [];
  const matchIDs: string[] = [];
  if (!seasonFixturesData.length) {
    return false;
  }
  seasonFixturesData.forEach(element => {
    const id = element.id;
    const fixtureData = element.data() as MatchFixture;
    const date = fixtureData.date;
    fixtures.push({ ...fixtureData, id, date });
  });
  fixtures.sort(sortObjectByKey('date'));
  fixtures.some(element => {
    if (element.hasOwnProperty('type') && element.type === 'FCP' && (element.home.name === 'TBD' || element.away.name === 'TBD')) {
      matchIDs.push(element['id']);
      return true;
    }
    return false;
  })
  fixtures.some(element => {
    if (element.hasOwnProperty('type') && element.type === 'FKC' && (element.home.name === 'TBD' || element.away.name === 'TBD')) {
      matchIDs.push(element['id']);
      return true;
    }
    return false;
  })
  fixtures.some(element => {
    if (element.hasOwnProperty('type') && element.type === 'FPL' && (element.home.name === 'TBD' || element.away.name === 'TBD')) {
      matchIDs.push(element['id']);
      return true;
    }
    return false;
  })
  matchIDs.forEach(matchID => {
    const tempFixture: any = fixtures.find(fixture => fixture.id === matchID);
    if (tempFixture) {
      selectedFixtures.push({ id: matchID, ...tempFixture as MatchFixture });
    }
  });
  selectedFixtures.forEach(fixture => {
    const id = fixture.id || '';
    if (fixture.home.name === 'TBD') {
      allPromises.push(db.collection('allMatches').doc(id).update({
        home: value,
        teams: admin.firestore.FieldValue.arrayUnion(value.name)
      }));
    } else if (fixture.away.name === 'TBD') {
      allPromises.push(db.collection('allMatches').doc(id).update({
        away: value,
        teams: admin.firestore.FieldValue.arrayUnion(value.name)
      }));
    }
  })

  if (!allPromises.length) {
    return false;
  }
  allPromises.push(db.collection(`seasons/${sid}/participants`).add(participant));
  return Promise.all(allPromises);
}

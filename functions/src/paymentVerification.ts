import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { OrderBasic } from '@shared/interfaces/order.model';
import { SeasonBasicInfo, SeasonParticipants, } from '@shared/interfaces/season.model';
import { TeamBasicInfo } from '@shared/interfaces/team.model';
import { isFixtureAvailableAway, isFixtureAvailableHome, isFixtureAvailableHomeOrAway, sortObjectByKey, TO_BE_DECIDED } from './utils/utilities';
import { environment } from '../../environments/environment';
import { MatchFixture } from '@shared/interfaces/match.model';
import { LeagueTableModel } from '@shared/interfaces/others.model';

const crypto = require('crypto');
const db = admin.firestore();

export async function paymentVerification(data: any, context: any): Promise<any> {

  const ORDER_ID = data && data.razorpay_order_id ? data.razorpay_order_id : null;
  const PAYMENT_ID = data && data.razorpay_payment_id ? data.razorpay_payment_id : null;
  const SIGNATURE = data && data.razorpay_signature ? data.razorpay_signature : null;
  const KEY_SECRET = environment.razorPay.key_secret;
  const season = data && data.season ? (data.season as SeasonBasicInfo) : null;
  const teamID = data && data.tid ? data.tid : null;
  const batch = db.batch();
  const seasonID = season?.id;
  let generatedSignature = null;
  let newOrder: OrderBasic;
  let teamInfo: TeamBasicInfo;
  let participantDetail: SeasonParticipants;

  if (!ORDER_ID || !PAYMENT_ID || !season || !seasonID || !batch) {
    throw new functions.https.HttpsError('invalid-argument', 'Error Occurred! Please try again later');
  }
  // check if participation is allowed
  const totalParticipants = (await db.collection(`seasons/${seasonID}/participants`).get()).size;
  if (totalParticipants >= season.p_teams) {
    throw new functions.https.HttpsError('permission-denied', 'Season participation is full!');
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
      prodPrice: season.feesPerTeam,
      prodId: seasonID,
      prodType: 'season',
    },
  };

  if (!teamID || !newOrder || !SIGNATURE || !generatedSignature || SIGNATURE !== generatedSignature) {
    throw new functions.https.HttpsError('unauthenticated', 'Payment Authentication failed!');
  }

  teamInfo = (await db.collection('teams').doc(teamID).get()).data() as TeamBasicInfo;
  participantDetail = {
    tid: data.tid,
    name: teamInfo.tname,
    logo: teamInfo.imgpath_logo,
  }

  // Saving season order
  const docRef = db.collection('seasonOrders').doc(ORDER_ID);
  batch.set(docRef, newOrder);

  // getting all season fixtures
  const seasonFixtures: MatchFixture[] = (await db.collection('allMatches').where('season', '==', season.name).get()).docs.map((fixtureData) => ({ ...fixtureData.data() as MatchFixture, id: fixtureData.id }));
  if (!seasonFixtures.length) {
    throw new functions.https.HttpsError('invalid-argument', 'Error Occurred! Please try again later');
  }

  // getting available/empty fixtures for FPL, FKC & FCP
  const availableFCPMatches = seasonFixtures.filter(fixture => fixture.type === 'FCP' && isFixtureAvailableHomeOrAway(fixture));
  const availableFKCMatches = seasonFixtures.filter(fixture => fixture.type === 'FKC' && isFixtureAvailableHomeOrAway(fixture));
  const availableFPLMatches = seasonFixtures.filter(fixture => fixture.type === 'FPL' && isFixtureAvailableHomeOrAway(fixture));

  // Assigning participant in available/empty FCP
  if (availableFCPMatches.length) {
    availableFCPMatches.sort(sortObjectByKey('date'));
    for (let i = 0; i < availableFCPMatches.length; i++) {
      const matchID = availableFCPMatches[i].id;
      const updateDoc: any = {};
      const updateKey = isFixtureAvailableHome(availableFCPMatches[i]) ? 'home' : 'away';
      updateDoc[updateKey] = {
        name: participantDetail.name,
        logo: participantDetail.logo
      };
      updateDoc['teams'] = admin.firestore.FieldValue.arrayUnion(participantDetail.name);

      if (matchID) {
        const updateRef = db.collection('allMatches').doc(matchID);
        batch.update(updateRef, updateDoc);
        break;
      }
    }
  }

  // Assigning participant in available/empty FKC
  if (availableFKCMatches.length) {
    availableFKCMatches.sort(sortObjectByKey('date'));
    for (let i = 0; i < availableFKCMatches.length; i++) {
      const matchID = availableFKCMatches[i].id;
      const updateDoc: any = {};
      const updateKey = isFixtureAvailableHome(availableFKCMatches[i]) ? 'home' : 'away';
      updateDoc[updateKey] = {
        name: participantDetail.name,
        logo: participantDetail.logo
      };
      updateDoc['teams'] = admin.firestore.FieldValue.arrayUnion(participantDetail.name);

      if (matchID) {
        const updateRef = db.collection('allMatches').doc(matchID);
        batch.update(updateRef, updateDoc);
        break;
      }
    }
  }

  // Assigning participant in available/empty FPL
  if (availableFPLMatches.length) {
    availableFPLMatches.sort(sortObjectByKey('date'));
    const assignedRivals: any[] = [];
    let matchesCount = season.p_teams - 1;
    for (let i = 0; i < availableFPLMatches.length; i++) {
      if (assignedRivals.includes(availableFPLMatches[i].home.name) || assignedRivals.includes(availableFPLMatches[i].away.name)) {
        continue;
      }
      if (matchesCount <= 0) {
        break;
      }
      let updateDoc: any = {};
      updateDoc['id'] = availableFPLMatches[i].id;
      updateDoc['teams'] = admin.firestore.FieldValue.arrayUnion(participantDetail.name);
      if (isFixtureAvailableHome(availableFPLMatches[i])) {
        updateDoc['home'] = {
          name: participantDetail.name,
          logo: participantDetail.logo
        };
        if (!isFixtureAvailableAway(availableFPLMatches[i])) {
          assignedRivals.push(availableFPLMatches[i].away.name);
        }
      } else if (isFixtureAvailableAway(availableFPLMatches[i])) {
        updateDoc['away'] = {
          name: participantDetail.name,
          logo: participantDetail.logo
        };
        if (!isFixtureAvailableHome(availableFPLMatches[i])) {
          assignedRivals.push(availableFPLMatches[i].home.name);
        }
      }
      if ((updateDoc.hasOwnProperty('home') || updateDoc.hasOwnProperty('away')) && updateDoc['id']) {
        const updateRef = db.collection('allMatches').doc(updateDoc['id']);
        batch.update(updateRef, updateDoc);
        matchesCount -= 1;
      }
    }

    // updating league table
    const dataTemp = (await db.collection('leagues').doc(seasonID).get()).data();
    if (dataTemp) {
      const leagueData: LeagueTableModel[] = Object.values(dataTemp);
      for (let i = 0; i < leagueData.length; i++) {
        if (leagueData[i]?.tData?.name === TO_BE_DECIDED) {
          leagueData[i].tData.name = participantDetail.name;
          leagueData[i].tData.logo = participantDetail.logo;
          break;
        }
      }
      const leagueRef = db.collection('leagues').doc(seasonID);
      batch.update(leagueRef, { ...leagueData });
    }
  }

  // Adding participant in season
  const participantRef = db.collection(`seasons/${seasonID}/participants`).doc();
  batch.set(participantRef, participantDetail);

  return batch.commit();
}

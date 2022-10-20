import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { OrderBasic } from '../../src/app/shared/interfaces/order.model';
import { SeasonBasicInfo, SeasonParticipants, } from '../../src/app/shared/interfaces/season.model';
import { TeamBasicInfo } from '../../src/app/shared/interfaces/team.model';
import { sortObjectByKey, TO_BE_DECIDED } from './utils/utilities';
import { environment } from '../../src/environments/environment';
import { MatchFixture } from '../../src/app/shared/interfaces/match.model';
import { LeagueTableModel } from '../../src/app/shared/interfaces/others.model';

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
  const assignedRivals: any[] = [];
  if (availableFPLMatches.length) {
    availableFPLMatches.sort(sortObjectByKey('date'));
    for (let i = 0; i < availableFPLMatches.length; i++) {
      if (isFixtureAvailableHomeAndAway(availableFPLMatches[i]) || (!assignedRivals.includes(availableFPLMatches[i].home.name) && !assignedRivals.includes(availableFPLMatches[i].home.name))) {
        // fixtures that are either fully available or one opponent is not repeated.
        const matchID = availableFPLMatches[i].id;
        if (isFixtureAvailableAway(availableFPLMatches[i]) && availableFPLMatches[i].away.name !== TO_BE_DECIDED) {
          assignedRivals.push(availableFPLMatches[i].away.name);
        } else if (isFixtureAvailableHome(availableFPLMatches[i]) && availableFPLMatches[i].home.name !== TO_BE_DECIDED) {
          assignedRivals.push(availableFPLMatches[i].home.name);
        }
        if (assignedRivals.length >= season.p_teams) {
          break;
        }
        if (matchID) {
          const updateDoc: any = {};
          const updateKey = isFixtureAvailableHome(availableFPLMatches[i]) ? 'home' : 'away';
          updateDoc[updateKey] = {
            name: participantDetail.name,
            logo: participantDetail.logo
          }
          updateDoc['teams'] = admin.firestore.FieldValue.arrayUnion(participantDetail.name);
          const updateRef = db.collection('allMatches').doc(matchID);
          batch.update(updateRef, updateDoc);
        }
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

export function isFixtureAvailableHomeAndAway(fixture: MatchFixture): boolean {
  return isFixtureAvailableHome(fixture) && isFixtureAvailableAway(fixture);
}

export function isFixtureAvailableHomeOrAway(fixture: MatchFixture): boolean {
  return isFixtureAvailableHome(fixture) || isFixtureAvailableAway(fixture);
}

export function isFixtureAvailableHome(fixture: MatchFixture): boolean {
  return fixture?.home?.name === TO_BE_DECIDED;
}

export function isFixtureAvailableAway(fixture: MatchFixture): boolean {
  return fixture?.away?.name === TO_BE_DECIDED;
}

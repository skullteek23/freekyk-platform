import { ICancelData, MatchFixture } from '@shared/interfaces/match.model';
import { ICloudCancelData, SeasonBasicInfo } from '@shared/interfaces/season.model';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';


const db = admin.firestore();

export async function seasonCancellation(data: ICloudCancelData, context: any): Promise<any> {
  const description = data?.description || null;
  const reason = data?.reason || null;
  const seasonID = data?.seasonID || null;
  const uid = data?.uid || null;
  const batch = db.batch();
  const date = new Date().getTime();

  if (!description || !reason || !seasonID || !batch || !uid) {
    throw new functions.https.HttpsError('invalid-argument', 'Error Occurred! Please try again later');
  }

  const seasonInfo = (await db.collection('seasons').doc(seasonID).get()).data() as SeasonBasicInfo;

  if (!seasonInfo || seasonInfo.status !== 'PUBLISHED') {
    throw new functions.https.HttpsError('invalid-argument', 'Season is already either cancelled or finished!');
  }

  const seasonRef = db.collection('seasons').doc(seasonID);
  const cancellationDocRef = db.collection('cancellations').doc();

  // update season status & timestamp
  const seasonUpdate: Partial<SeasonBasicInfo> = {};
  seasonUpdate.status = 'CANCELLED';
  seasonUpdate.lastUpdated = date;
  batch.update(seasonRef, seasonUpdate);

  // add doc to cancellation
  const cancellationDoc: ICancelData = {
    reason,
    description,
    date,
    docID: seasonID,
    uid,
    type: 'cancel-season',
  }
  batch.create(cancellationDocRef, cancellationDoc);

  // update each match status
  const seasonFixturesId = (await db.collection('allMatches').where('season', '==', seasonInfo.name).get()).docs.map(el => el.id);
  for (let i = 0; i < seasonFixturesId.length; i++) {
    if (seasonFixturesId[i] !== null) {
      const matchRef = db.collection('allMatches').doc(seasonFixturesId[i]);
      const update: Partial<MatchFixture> = {};
      update.status = 5;
      batch.update(matchRef, update);
    }
  }

  // future ground bookings deletion
  const groundBookingsList = (await db.collection('groundBookings').where('season', '==', seasonInfo.name).where('slotTimestamp', '>=', date).get()).docs.map(el => el.id);
  for (let i = 0; i < groundBookingsList.length; i++) {
    if (groundBookingsList[i] !== null) {
      const bookingRef = db.collection('groundBookings').doc(groundBookingsList[i]);
      batch.delete(bookingRef);
    }
  }

  return batch.commit();
}

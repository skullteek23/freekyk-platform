import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';


const db = admin.firestore();

export async function seasonCancellation(data: any, context: any): Promise<any> {
  // season cancellation
  // update season status
  // update season timestamp
  // update each match status
  // add doc to cancellation

  const description = data?.description || null;
  const reason = data?.reason || null;
  const seasonID = data?.seasonID || null;

  if (!description || !reason || !seasonID) {
    throw new functions.https.HttpsError('invalid-argument', 'Error Occurred! Please try again later');
  }

  const seasonInfo = (await db.collection('seasons').doc(seasonID).get()).data() as SeasonBasicInfo;

  if (seasonInfo.status === 'CANCELLED' || seasonInfo.status === 'FINISHED') {
    throw new functions.https.HttpsError('invalid-argument', 'Season is already either cancelled or finished!');
  }
  return true;
}

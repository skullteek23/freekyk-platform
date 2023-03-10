import { IPlayer } from '@shared/interfaces/user.model';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();
const auth = admin.auth();

export async function newProfile(data: { name: string; uid: string }, context: any): Promise<any> {

  const UID = data && data.uid ? data.uid : null;
  const name = data && data.name ? data.name : '';
  const allPromises: any[] = [];

  if (UID && name) {
    const playerProfile: Partial<IPlayer> = {};
    playerProfile.name = name;
    allPromises.push(auth.updateUser(UID, { displayName: playerProfile.name }));
    allPromises.push(db.collection('players').doc(UID).set({ ...playerProfile }));

    return Promise.all(allPromises);
  }
  throw new functions.https.HttpsError('invalid-argument', 'Invalid name!');
}

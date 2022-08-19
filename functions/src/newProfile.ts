import * as admin from 'firebase-admin';

const db = admin.firestore();
const auth = admin.auth();

export async function newProfile(data: { name: string; uid: string }, context: any): Promise<any> {

  const UID = data && data.uid ? data.uid : null;
  const name = data && data.name ? data.name : '';
  const allPromises: any[] = [];

  if (UID && name) {
    allPromises.push(auth.updateUser(UID, { displayName: name }));
    allPromises.push(db.collection('players').doc(UID).set({ name, team: null }));

    return Promise.all(allPromises);
  }
  return false;
}

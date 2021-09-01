/* eslint-disable */
import * as admin from 'firebase-admin';
import {
  BasicStats,
  FsStats,
} from '../../src/app/shared/interfaces/user.model';
const db = admin.firestore();
const auth = admin.auth();
export async function newProfile(
  data: { name: string; uid: string },
  context: any
) {
  try {
    //get
    console.log(data);
    console.log(context);
    //get

    // create
    const newPlayerStats: BasicStats = {
      apps: 0,
      g: 0,
      w: 0,
      cards: 0,
      l: 0,
    };
    const newFsStats: FsStats = {
      sk_lvl: 0,
      br_colb: [],
      top_vids: [],
      tr_a: 0,
      tr_w: 0,
      tr_u: 0,
    };
    // create

    // update
    // update
    let twoPromises: any[] = [];
    twoPromises.push(
      auth.updateUser(data.uid, {
        displayName: data.name,
      })
    );
    twoPromises.push(
      db.collection('players').doc(data.uid).set({
        name: data.name,
        team: null,
      })
    );
    twoPromises.push(
      db
        .collection('players/' + data.uid + '/additionalInfo')
        .doc('statistics')
        .set(newPlayerStats)
    );
    twoPromises.push(
      db.collection('freestylers').doc(data.uid).set({
        name: data.name,
      })
    );
    twoPromises.push(
      db
        .collection('freestylers/' + data.uid + '/additionalInfoFs')
        .doc('statistics')
        .set(newFsStats)
    );
    return await Promise.all(twoPromises);
  } catch (error) {
    console.log(error);
    return error;
  }
}

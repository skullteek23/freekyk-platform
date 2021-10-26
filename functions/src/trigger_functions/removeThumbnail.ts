import { Storage } from '@google-cloud/storage';
import * as admin from 'firebase-admin';
const gcs = new Storage();
const db = admin.firestore();
import * as functions from 'firebase-functions';

export async function removeThumbnail(
  object: functions.storage.ObjectMetadata,
  context: any
): Promise<any> {
  if (!object || !object.name || !object.name.startsWith('image')) {
    console.log('exiting function');
    return false;
  }
  const bucket = gcs.bucket(object.bucket);
  const objName = object.name || '';
  const uid = objName.split('_')[1];
  const thumbObjName = 'thumb_' + uid;
  const allPromises: any[] = [];
  allPromises.push(
    db
      .collection(`players/${uid}/additionalInfo`)
      .doc('otherInfo')
      .update({ imgpath_lg: admin.firestore.FieldValue.delete() })
  );
  allPromises.push(
    db
      .collection('players')
      .doc(uid)
      .update({ imgpath_sm: admin.firestore.FieldValue.delete() })
  );
  allPromises.push(
    db
      .collection('freestylers')
      .doc(uid)
      .update({ imgpath_lg: admin.firestore.FieldValue.delete() })
  );
  allPromises.push(bucket.file(thumbObjName).delete());
  return Promise.all(allPromises);
}

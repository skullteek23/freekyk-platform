import { Storage } from '@google-cloud/storage';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const gcs = new Storage();
const db = admin.firestore();

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
  const FieldValue = admin.firestore.FieldValue;
  console.log(uid);
  allPromises.push(
    db
      .collection(`players/${uid}/additionalInfo`)
      .doc('otherInfo')
      .update({ imgpath_lg: FieldValue.delete() })
  );
  allPromises.push(
    db
      .collection('players')
      .doc(uid)
      .update({ imgpath_sm: FieldValue.delete() })
  );
  allPromises.push(
    db
      .collection('freestylers')
      .doc(uid)
      .update({ imgpath_lg: FieldValue.delete() })
  );
  await Promise.all(allPromises);
  return bucket.file(thumbObjName).delete();
}

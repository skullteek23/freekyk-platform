// import { Storage } from '@google-cloud/storage';
// import * as admin from 'firebase-admin';
// const gcs = new Storage();
// const db = admin.firestore();
// import * as functions from 'firebase-functions';

// export async function removeThumbnail(object: functions.storage.ObjectMetadata, context: any): Promise<any> {

//   const fileName = object?.name;
//   if (!object || !fileName || !fileName.startsWith('image')) {
//     return false;
//   }
//   const bucket = gcs.bucket(object.bucket);
//   const UID = fileName.split('_')[1];
//   const thumbObjName = 'thumb_' + UID;
//   const allPromises: any[] = [];

//   const deleteFile = bucket.file(thumbObjName);

//   if (deleteFile) {
//     allPromises.push(db.collection(`players/${UID}/additionalInfo`).doc('otherInfo').update({ imgpath_lg: admin.firestore.FieldValue.delete() }));
//     allPromises.push(db.collection('players').doc(UID).update({ imgpath_sm: admin.firestore.FieldValue.delete() }));
//     allPromises.push(deleteFile.delete());
//     return Promise.all(allPromises);
//   }

//   return false;
// }

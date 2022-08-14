import { Storage } from '@google-cloud/storage';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import * as sharp from 'sharp';
import * as fs from 'fs-extra';
import * as admin from 'firebase-admin';
const gcs = new Storage();
const db = admin.firestore();
import * as functions from 'firebase-functions';

export async function generateThumbnail(object: functions.storage.ObjectMetadata, context: any): Promise<any> {
  if (!object || !object.name) {
    console.log('exiting function');
    return false;
  }
  const bucket = gcs.bucket(object.bucket);
  const contentType = object.contentType || '';
  const filePath = object.name;
  const fileNameTemp = filePath.split('/').pop();
  const fileName = fileNameTemp || '';
  const uid = fileName ? fileName.split('_')[1] : '';
  const bucketDir = dirname(filePath);

  const workingDir = join(tmpdir(), 'thumbs');
  const tmpFilePath = join(workingDir, 'source.png');

  if (fileName.includes('thumb') || !contentType.includes('image')) {
    console.log('exiting function');
    return false;
  }

  // 1. Ensure thumbnail dir exists
  await fs.ensureDir(workingDir);

  // 2. Download Source File
  await bucket.file(filePath).download({
    destination: tmpFilePath
  });

  // 3. Resize the images and define an array of upload promises
  const sizes = [64];
  const uploadPromises: any[] = [];
  const thumbName = `thumb_${uid}`;
  const thumbPath = join(workingDir, thumbName);

  // Resize source image
  await sharp(tmpFilePath).resize(sizes[0], sizes[0]).toFile(thumbPath);

  // Upload to GCS
  const urlSnap = await bucket
    .upload(thumbPath, {
      destination: join(bucketDir, thumbName),
      contentType,
    })
    .then((res) => {
      return res[0].getSignedUrl({
        action: 'read',
        expires: new Date('31 December 2199'),
      });
    });

  uploadPromises.push(db.collection('players').doc(uid).update({ imgpath_sm: urlSnap[0] }));
  uploadPromises.push(db.collection('freestylers').doc(uid).update({ imgpath_lg: urlSnap[0] }));
  uploadPromises.push(fs.remove(workingDir));

  // 4. Run the upload operations
  return Promise.all(uploadPromises);
}

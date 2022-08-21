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

  const SIZE = 64;
  const allPromises: any[] = [];
  const filePath = object.name;
  const contentType = object && object.contentType ? object.contentType : '';

  if (!object || !filePath || !contentType.includes('image')) {
    return false;
  }

  const bucketRef = gcs.bucket(object.bucket);
  const fileName = filePath.split('/').pop() || '';

  if (fileName.includes('thumb')) {
    return false;
  }

  const UID = fileName ? fileName.split('_')[1] : '';
  const bucketDir = dirname(filePath);
  const workingDir = join(tmpdir(), 'thumbs');
  const tmpFilePath = join(workingDir, 'source.png');
  const thumbName = `/thumbnails/thumb_${UID}`;
  const thumbPath = join(workingDir, thumbName);

  // 1. Ensure thumbnail dir exists
  await fs.ensureDir(workingDir);

  // 2. Download Source File
  await bucketRef.file(filePath).download({ destination: tmpFilePath });

  // Resize source image using sharp library
  await sharp(tmpFilePath).resize(SIZE, SIZE).toFile(thumbPath);

  // Upload to GCS
  const uploadedFile = await bucketRef.upload(thumbPath, { destination: join(bucketDir, thumbName), contentType });
  const uploadedFilePathTemp = uploadedFile && uploadedFile[0] ? await uploadedFile[0].getSignedUrl({ action: 'read', expires: new Date('31 December 2199') }) : null;

  // Update player documents
  if (uploadedFilePathTemp && workingDir) {
    allPromises.push(db.collection('players').doc(UID).update({ imgpath_sm: uploadedFilePathTemp[0] }));
    allPromises.push(fs.remove(workingDir));
    return Promise.all(allPromises);
  }
  return false;
}

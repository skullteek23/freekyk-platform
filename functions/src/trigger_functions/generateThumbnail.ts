import { join, dirname } from 'path';
import { tmpdir } from 'os';
import * as sharp from 'sharp';
import * as fs from 'fs-extra';
import * as admin from 'firebase-admin';
const uuid = require("uuid-v4");
const db = admin.firestore();
const gcsStorage = admin.storage();
import * as functions from 'firebase-functions';
import { createPersistentDownloadUrl } from 'src/utils/utilities';

export async function generateThumbnail(object: functions.storage.ObjectMetadata, context: any): Promise<any> {

  const SIZE = 64;
  const allPromises: any[] = [];
  const filePath = object?.name;
  const contentType = object?.contentType;

  if (!object || !filePath || !contentType?.includes('image')) {
    return false;
  }

  const bucketRef = gcsStorage.bucket(object.bucket);
  const fileName = filePath.split('/').pop() || '';

  if (fileName.includes('thumb') || !filePath.includes('profileimage')) {
    return false;
  }

  const UID = fileName ? fileName.split('_')[1] : '';
  const bucketDir = dirname(filePath);
  const workingDir = join(tmpdir(), 'thumbs');
  const timestamp = new Date().getTime();
  const tmpFilePath = join(workingDir, `${timestamp}.png`);
  const thumbName = `thumb_${UID}`;
  const thumbPath = join(workingDir, thumbName);

  // 1. Ensure thumbnail dir exists
  await fs.ensureDir(workingDir);

  // 2. Download Source File
  await bucketRef.file(filePath).download({ destination: tmpFilePath });

  // Resize source image using sharp library
  await sharp(tmpFilePath).resize(SIZE, SIZE).toFile(thumbPath);

  // Upload to GCS
  const accessToken = uuid();
  await bucketRef.upload(thumbPath, {
    destination: join(bucketDir, `/thumbnails/${thumbName}`),
    contentType,
    metadata: {
      cacheControl: "max-age=31536000",
      metadata: {
        firebaseStorageDownloadTokens: accessToken,
      },
    },
  });
  const imgpath_sm = createPersistentDownloadUrl(object.bucket, `profileImages/thumbnails/${thumbName}`, accessToken);

  // Update player documents
  if (imgpath_sm && workingDir) {
    allPromises.push(db.collection('players').doc(UID).update({ imgpath_sm }));
    allPromises.push(fs.remove(workingDir));
    return Promise.all(allPromises);
  }
  return false;
}

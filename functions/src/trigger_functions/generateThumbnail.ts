import { Storage } from '@google-cloud/storage';
const gcs = new Storage();
import * as functions from 'firebase-functions';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import * as admin from 'firebase-admin';
const db = admin.firestore();

import * as sharp from 'sharp';
import * as fs from 'fs-extra';
import { PlayerBasicInfo } from '../../../src/app/shared/interfaces/user.model';

export async function generateThumbnail(
  object: functions.storage.ObjectMetadata,
  context
): Promise<any> {
  if (
    !object.name.startsWith('images/players') ||
    !object.contentType.includes('image')
  ) {
    console.log('exiting function');
    return false;
  }
  const bucket = gcs.bucket(object.bucket);
  const thumbnailBucket = gcs.bucket('gs://football-platform-v1-thumbnails');
  const filePath = object.name;
  const fileName = filePath.split('/')[2];
  const newbucketDir = dirname(`thumbnails/players`);

  const workingDir = join(tmpdir(), 'thumbs');
  const tmpFilePath = join(workingDir, 'source.png');

  // 1. Ensure thumbnail dir exists
  await fs.ensureDir(workingDir);

  // 2. Download Source File
  await bucket.file(filePath).download({
    destination: tmpFilePath,
  });

  // 3. Resize the images and define an array of upload promises
  const newSize = 64;
  const uploadPromises = [];

  const thumbName = `thumb@${fileName}`;
  const thumbPath = join(workingDir, thumbName);

  // Resize source image
  await sharp(tmpFilePath).resize(newSize, newSize).toFile(thumbPath);

  // Upload to GCS
  const urlSnap = await thumbnailBucket
    .upload(thumbPath, {
      destination: join(newbucketDir, thumbName),
    })
    .then(() => {
      const file = thumbnailBucket.file(thumbPath);
      return file.getSignedUrl({
        action: 'read',
        expires: new Date('31 December 2199'),
      });
    });

  const isImgExists = (
    (await (
      await db.collection('players').doc().get()
    ).data()) as PlayerBasicInfo
  ).imgpath_sm;
  // Save thumbnail in Database
  if (!isImgExists) {
    uploadPromises.push(
      db.collection('players').doc(fileName).set(
        {
          imgpath_sm: urlSnap[0],
        },
        { merge: true }
      )
    );
  } else {
    uploadPromises.push(
      db.collection('players').doc(fileName).update({
        imgpath_sm: urlSnap[0],
      })
    );
  }

  // 4. Cleanup remove the tmp/thumbs from the filesystem
  uploadPromises.push(fs.remove(workingDir));

  // 5. Run the upload operations
  return Promise.all(uploadPromises);
}

import { Storage } from '@google-cloud/storage';
const gcs = new Storage();
import * as admin from 'firebase-admin';
const db = admin.firestore();
const storage = admin.storage();
import * as functions from 'firebase-functions';
import { tmpdir } from 'os';
import { join, dirname } from 'path';

import * as sharp from 'sharp';
import * as fs from 'fs-extra';

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
  const bucketDir = dirname(filePath);

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
  uploadPromises.push(
    thumbnailBucket.upload(thumbPath, {
      destination: join(bucketDir, thumbName),
    })
    // .then((data) => {
    //   const file = data[0];
    //   db.collection('players')
    //     .doc(fileName)
    //     .update({
    //       imgpath_sm:
    //         'https://firebasestorage.googleapis.com/v0/b/' +
    //         thumbnailBucket.name +
    //         '/o/' +
    //         encodeURIComponent(file.name) +
    //         '?alt=media&token=' +
    //         uuid,
    //     });
    // })
  );
  // await admin.storage().bucket(thumbnailBucket.name).getSignedUrl()
  gcs
    .bucket(thumbnailBucket.name)
    .getMetadata()
    .then((res) => res[0]);

  // 4. Run the upload operations
  await Promise.all(uploadPromises);

  // 5. Cleanup remove the tmp/thumbs from the filesystem
  return fs.remove(workingDir);
}

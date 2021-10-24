import { Storage } from '@google-cloud/storage';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import * as sharp from 'sharp';
import * as fs from 'fs-extra';
import * as admin from 'firebase-admin';
const gcs = new Storage();
const db = admin.firestore();

export async function generateThumbnail(object, context): Promise<any> {
  const bucket = gcs.bucket(object.bucket);
  const filePath = object.name;
  const fileName = filePath.split('/').pop();
  const bucketDir = dirname(filePath);

  const workingDir = join(tmpdir(), 'thumbs');
  const tmpFilePath = join(workingDir, 'source.png');

  if (fileName.includes('thumb@') || !object.contentType.includes('image')) {
    console.log('exiting function');
    return false;
  }

  // 1. Ensure thumbnail dir exists
  await fs.ensureDir(workingDir);

  // 2. Download Source File
  await bucket.file(filePath).download({
    destination: tmpFilePath,
  });

  // 3. Resize the images and define an array of upload promises
  const sizes = [64];
  const uploadPromises = [];
  const thumbName = `thumb_${fileName}`;
  const thumbPath = join(workingDir, thumbName);

  // Resize source image
  await sharp(tmpFilePath).resize(sizes[0], sizes[0]).toFile(thumbPath);

  // Upload to GCS
  uploadPromises.push(
    bucket
      .upload(thumbPath, {
        destination: join(bucketDir, thumbName),
      })
      .then((res) => {
        console.log(res[0]);
        console.log(res[1]);
      })
  );
  const urlSnap = await bucket
    .upload(thumbPath, {
      destination: join(bucketDir, thumbName),
      contentType: object.contentType,
    })
    .then(() => {
      const file = bucket.file(thumbPath);
      return file.getSignedUrl({
        action: 'read',
        expires: new Date('31 December 2199'),
      });
    });
  // uploadPromises.push(
  //   db.collection('players').doc(fileName).update({
  //     imgpath_sm: urlSnap[0],
  //   })
  // );
  // uploadPromises.push(
  //   db.collection(`players/${fileName}/additionalInfo`).doc('otherInfo').set(
  //     {
  //       imgpath_lg: urlSnap[0],
  //     },
  //     { merge: true }
  //   )
  // );
  // uploadPromises.push(
  //   db.collection('freestylers').doc(fileName).update({
  //     imgpath_lg: urlSnap[0],
  //   })
  // );

  // 4. Run the upload operations
  await Promise.all(uploadPromises);

  // 5. Cleanup remove the tmp/thumbs from the filesystem
  return fs.remove(workingDir);
}

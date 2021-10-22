import * as functions from 'firebase-functions';

import { Storage } from '@google-cloud/storage';
// import * as admin from 'firebase-admin';
const gcs = new Storage();
// const db = admin.firestore();

import { tmpdir } from 'os';
import { join, dirname } from 'path';

import * as sharp from 'sharp';
import * as fs from 'fs-extra';

export async function generateThumbnail(
  object: functions.storage.ObjectMetadata,
  context: functions.EventContext
): Promise<any> {
  console.log(object.name);
  const bucket = gcs.bucket(object.bucket);
  const filePath = object.name;
  const fileName = object.name;
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
  const sizes = [64, 128, 256];

  const uploadPromises = sizes.map(async (size) => {
    const thumbName = `thumb@${size}_${fileName}`;
    const thumbPath = join(workingDir, thumbName);

    // Resize source image
    await sharp(tmpFilePath).resize(size, size).toFile(thumbPath);

    // Upload to GCS
    return bucket.upload(thumbPath, {
      destination: join(bucketDir, thumbName),
    });
  });

  // 4. Run the upload operations
  await Promise.all(uploadPromises);

  // 5. Cleanup remove the tmp/thumbs from the filesystem
  return fs.remove(workingDir);
}

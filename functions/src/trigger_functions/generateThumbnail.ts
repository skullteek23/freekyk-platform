import { Storage } from '@google-cloud/storage';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { IMAGES_BUCKET, THUMBNAILS_BUCKET } from '../constants';
import * as sharp from 'sharp';
import * as fs from 'fs-extra';
const gcs = new Storage();

export async function generateThumbnail(object, context): Promise<any> {
  if (
    !object.name.startsWith('images/players') ||
    !object.contentType.includes('image')
  ) {
    console.log('exiting function');
    return false;
  }
  const bucket = gcs.bucket(IMAGES_BUCKET);
  const thumbnailBucket = gcs.bucket(THUMBNAILS_BUCKET);
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

  const thumbName = `thumbnail_${fileName}`;
  const thumbPath = join(workingDir, thumbName);

  // Resize source image
  await sharp(tmpFilePath).resize(newSize, newSize).toFile(thumbPath);

  // Upload to GCS
  const urlSnap = await thumbnailBucket
    .upload(thumbPath, {
      destination: join(newbucketDir, thumbName),
      contentType: object.contentType,
    })
    .then(() => {
      const file = thumbnailBucket.file(thumbPath);
      return file.getSignedUrl({
        action: 'read',
        expires: new Date('31 December 2199'),
      });
    });
  uploadPromises.push(
    this.ngFire.collection('players').doc(fileName).update({
      imgpath_sm: urlSnap[0],
    })
  );
  uploadPromises.push(
    this.ngFire
      .collection(`players/${fileName}/additionalInfo`)
      .doc('otherInfo')
      .set(
        {
          imgpath_lg: urlSnap[0],
        },
        { merge: true }
      )
  );
  uploadPromises.push(
    this.ngFire.collection('freestylers').doc(fileName).update({
      imgpath_lg: urlSnap[0],
    })
  );

  // 4. Cleanup remove the tmp/thumbs from the filesystem
  uploadPromises.push(fs.remove(workingDir));

  // 5. Run the upload operations
  return Promise.all(uploadPromises);
}

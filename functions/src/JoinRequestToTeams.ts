import * as admin from 'firebase-admin';
const db = admin.firestore();
import { NotificationBasic } from '../../src/app/shared/interfaces/notification.model';

export async function joinRequests(
  data: { capId: string[]; name: string },
  context: any
): Promise<any> {
  try {
    // get
    const batch = db.batch();
    // get

    // create
    data.capId.forEach((captainId) => {
      const newNotif: NotificationBasic = {
        type: 'request',
        senderId: context.auth?.uid === undefined ? '' : context.auth?.uid,
        recieverId: captainId,
        date: admin.firestore.Timestamp.fromDate(new Date()),
        title: 'Join Request',
        senderName: data.name,
      };
      const notifRef = db
        .collection('players/' + captainId + '/Notifications')
        .doc();
      batch.set(notifRef, newNotif);
    });
    // create

    // update
    return batch.commit();
    // update
  } catch (error) {
    return error;
  }
}

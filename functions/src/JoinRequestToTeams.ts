import * as admin from 'firebase-admin';
const db = admin.firestore();
import { NotificationBasic } from '../../src/app/shared/interfaces/notification.model';


export async function joinRequests(data: { capId: string[]; name: string }, context: any): Promise<any> {

  const CAPTAIN_IDS = data && data.capId ? data.capId : [];
  const requesterName = data && data.name ? data.name : '';

  if (CAPTAIN_IDS.length && requesterName) {
    const batch = db.batch();
    const UID = context && context.auth && context.auth.uid ? context.auth.uid : null;

    CAPTAIN_IDS.forEach((ID) => {
      const notification: NotificationBasic = {
        type: 'request',
        senderId: UID,
        receiverId: ID,
        date: admin.firestore.Timestamp.now(),
        title: 'Join Request',
        senderName: requesterName,
      };
      const notificationRef = db.collection(`players/${ID}/Notifications`).doc();

      batch.set(notificationRef, notification);
    });

    return batch.commit();
  }
  return false;
}

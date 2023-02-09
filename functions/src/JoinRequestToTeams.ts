import * as admin from 'firebase-admin';
const db = admin.firestore();
import { NotificationBasic } from '@shared/interfaces/notification.model';
import { ListOption } from '@shared/interfaces/others.model';


export async function joinRequests(data: { capId: ListOption[]; name: string }, context: any): Promise<any> {

  const CAPTAIN_IDS = data && data.capId ? data.capId : [];
  const requesterName = data && data.name ? data.name : '';

  if (CAPTAIN_IDS.length && requesterName) {
    const batch = db.batch();
    const UID = context && context.auth && context.auth.uid ? context.auth.uid : null;

    CAPTAIN_IDS.forEach((element) => {
      const notification: NotificationBasic = {
        type: 0,
        senderID: UID,
        senderName: requesterName,
        receiverID: element.value,
        receiverName: element.viewValue,
        date: new Date().getTime(),
        read: 0,
        expire: 0
      };
      const notificationRef = db.collection('notifications').doc();

      batch.set(notificationRef, notification);
    });

    return batch.commit();
  }
  return false;
}

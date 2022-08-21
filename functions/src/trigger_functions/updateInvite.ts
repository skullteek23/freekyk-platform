import * as admin from 'firebase-admin';
import { Invite, NotificationBasic } from '../../../src/app/shared/interfaces/notification.model';
import { joinTeam } from '../utils/utilities';

const db = admin.firestore();

export async function inviteUpdationTrigger(change: any, context: any): Promise<any> {

  const update = change.after.data() as Invite;
  const updateID = change.after.id || '';
  if (!update || !updateID) {
    return false;
  }
  switch (update.status) {
    case 'wait':
      const notification: NotificationBasic = {
        type: 'invite',
        senderId: update.teamId,
        receiverId: update.inviteeId,
        date: admin.firestore.Timestamp.now(),
        title: 'Team Join Invite',
        senderName: update.teamName,
      };
      return db.collection(`players/${notification.receiverId}/Notifications`).doc(updateID).set(notification);

    case 'reject':
      return db.collection(`players/${update.inviteeId}/Notifications`).doc(updateID).delete();

    case 'accept':
      return joinTeam(update, change.after.id);

    default:
      return true;
  }
}

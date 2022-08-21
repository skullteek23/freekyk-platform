import * as admin from 'firebase-admin';
import { Invite, NotificationBasic } from '../../../src/app/shared/interfaces/notification.model';

const db = admin.firestore();

export async function inviteCreationTrigger(snap: any, context: any): Promise<any> {

  const invite: Invite = snap.data() as Invite;
  const notificationID = invite.id;
  if (invite && notificationID) {
    const notification: NotificationBasic = {
      type: 'invite',
      senderId: invite.teamId,
      receiverId: invite.inviteeId,
      date: admin.firestore.Timestamp.now(),
      title: 'Team Join Invite',
      senderName: invite.teamName,
    };
    return db.collection(`players/${notification.receiverId}/Notifications`).doc(notificationID).set(notification);
  }
  return false;
}

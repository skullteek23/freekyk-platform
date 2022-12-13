import * as admin from 'firebase-admin';
import { Invite, NotificationBasic } from '@shared/interfaces/notification.model';

const db = admin.firestore();

export async function inviteCreationTrigger(snap: any, context: any): Promise<any> {

  const invite: Invite = snap.data() as Invite;
  const notificationID = snap.id;

  // console.log(invite);
  // console.log(notificationID);

  if (invite && notificationID) {
    const notification: NotificationBasic = {
      type: 'invite',
      senderId: invite.teamId,
      receiverId: invite.inviteeId,
      date: admin.firestore.Timestamp.now().toMillis(),
      title: 'Team Join Invite',
      senderName: invite.teamName,
    };
    return db.collection(`players/${invite.inviteeId}/Notifications`).doc(notificationID).set(notification);
  }
  return false;
}

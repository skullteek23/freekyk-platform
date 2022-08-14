import * as admin from 'firebase-admin';
import { Invite, NotificationBasic } from '../../../src/app/shared/interfaces/notification.model';
import { SendJoinNotification } from '../abstractFunctions';

export async function inviteCreationTrigger(snap: any, context: any): Promise<any> {
  try {
    const snapData: Invite = snap.data() as Invite;
    const newNotif: NotificationBasic = {
      type: 'invite',
      senderId: snapData.teamId,
      recieverId: snapData.inviteeId,
      date: admin.firestore.Timestamp.fromDate(new Date()),
      title: 'Team Join Invite',
      senderName: snapData.teamName,
    };

    return SendJoinNotification(newNotif, snapData.inviteeId, snap.id);
  } catch (error) {
    return error;
  }
}

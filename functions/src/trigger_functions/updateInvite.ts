import * as admin from 'firebase-admin';
import {
  Invite,
  NotificationBasic,
} from '../../../src/app/shared/interfaces/notification.model';
import {
  SendJoinNotification,
  onRejectTeam,
  onJoinTeam,
} from '../abstractFunctions';

export async function inviteUpdationTrigger(
  change: any,
  context: any
): Promise<any> {
  try {
    const afterUpdate: Invite = change.after.data() as Invite;
    if (afterUpdate.status === 'wait') {
      const newNotif: NotificationBasic = {
        type: 'invite',
        senderId: afterUpdate.teamId,
        recieverId: afterUpdate.inviteeId,
        date: admin.firestore.Timestamp.fromDate(new Date()),
        title: 'Team Join Invite',
        senderName: afterUpdate.teamName,
      };
      return SendJoinNotification(
        newNotif,
        afterUpdate.inviteeId,
        change.after.id
      );
    } else if (afterUpdate.status === 'reject') {
      return onRejectTeam(change.after.id, afterUpdate.inviteeId);
    } else if (afterUpdate.status === 'accept') {
      return onJoinTeam(afterUpdate, change.after.id);
    } else {
      return true;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

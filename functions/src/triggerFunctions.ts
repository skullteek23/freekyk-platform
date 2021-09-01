/* eslint-disable */
import * as admin from 'firebase-admin';
import {
  Invite,
  NotificationBasic,
} from '../../src/app/shared/interfaces/notification.model';
import {
  DeleteNotifById,
  onJoinTeam,
  onRejectTeam,
  SendJoinNotification,
} from './abstractFunctions';

export async function inviteCreationTrigger(snap: any, context: any) {
  try {
    const snapData: Invite = <Invite>snap.data();
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
    console.log(error);
    return error;
  }
}
export async function inviteUpdationTrigger(change: any, context: any) {
  try {
    const afterUpdate: Invite = <Invite>change.after.data();
    if (afterUpdate.status == 'wait') {
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
    } else if (afterUpdate.status == 'reject')
      return onRejectTeam(change.after.id, afterUpdate.inviteeId);
    else if (afterUpdate.status == 'accept')
      return onJoinTeam(afterUpdate, change.after.id);
    else return true;
  } catch (error) {
    console.log(error);
    return error;
  }
}
export async function inviteDeletionTrigger(snap: any, context: any) {
  try {
    let inviteId: string = snap.id;
    let delInvite: Invite = snap.data();
    DeleteNotifById(inviteId, delInvite.inviteeId);
  } catch (error) {
    console.log(error);
    return error;
  }
}

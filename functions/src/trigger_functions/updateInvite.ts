import * as admin from 'firebase-admin';
import { Invite, NotificationBasic } from '../../../src/app/shared/interfaces/notification.model';
import { Tmember } from '../../../src/app/shared/interfaces/team.model';
import { PlayerBasicInfo } from '../../../src/app/shared/interfaces/user.model';

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
        date: admin.firestore.Timestamp.now().toMillis(),
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


export async function joinTeam(invite: Invite, inviteID: string): Promise<any> {

  // const inviteID = invite.


  try {
    // get
    const playerSnap: PlayerBasicInfo = (await db.collection('players').doc(invite.inviteeId).get()).data() as PlayerBasicInfo;
    // get

    // create
    const newNotif: NotificationBasic = {
      type: 'team welcome',
      senderId: invite.teamId,
      receiverId: invite.inviteeId,
      date: new Date().getTime(),
      title: 'Welcome to our Team',
      senderName: invite.teamName,
    };
    const newMember: Tmember = {
      id: invite.inviteeId,
      name: playerSnap?.name,
      pl_pos: playerSnap?.pl_pos ? playerSnap?.pl_pos : null,
      imgpath_sm: playerSnap?.imgpath_sm ? playerSnap?.imgpath_sm : null,
    };

    // create

    // update
    const allPromises: any[] = [];
    allPromises.push(db.collection(`teams/${invite.teamId}/additionalInfo`).doc('members').update({
      memCount: admin.firestore.FieldValue.increment(1),
      members: admin.firestore.FieldValue.arrayUnion(newMember),
    }));
    allPromises.push(db.collection('players').doc(invite.inviteeId).update({
      team: {
        name: invite.teamName,
        id: invite.teamId,
      },
    }));
    allPromises.push(db.collection(`players/${invite.inviteeId}/Notifications`).add(newNotif));
    allPromises.push(db.collection(`players/${invite.inviteeId}/Notifications`).doc(inviteID).delete());
    allPromises.push(db.collection('invites').doc(inviteID).delete());
    // update

    return await Promise.all(allPromises);
  } catch (error) {
    return error;
  }
}

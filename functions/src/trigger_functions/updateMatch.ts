import * as admin from 'firebase-admin';
import { Invite, NotificationBasic } from '@shared/interfaces/notification.model';
import { Tmember } from '@shared/interfaces/team.model';
import { PlayerBasicInfo } from '@shared/interfaces/user.model';
import { MatchFixture } from '@shared/interfaces/match.model';

const db = admin.firestore();

export async function matchUpdateTrigger(change: any, context: any): Promise<any> {

  const update = change.after.data() as MatchFixture;
  const updateID = change.after.id || '';
  if (!update || !updateID || update.status !== 4) {
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
      read: false
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

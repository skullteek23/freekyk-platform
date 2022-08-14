import * as admin from 'firebase-admin';
const db = admin.firestore();
import { firestore } from 'firebase-admin';
import { Invite, NotificationBasic } from '../../src/app/shared/interfaces/notification.model';
import { SeasonBasicInfo, SeasonParticipants } from '../../src/app/shared/interfaces/season.model';
import { Tmember } from '../../src/app/shared/interfaces/team.model';
import { PlayerBasicInfo } from '../../src/app/shared/interfaces/user.model';

export async function onJoinTeam(invite: Invite, inviteId: string): Promise<any> {
  try {
    // get
    const playerSnap: PlayerBasicInfo = (await db.collection('players').doc(invite.inviteeId).get()).data() as PlayerBasicInfo;
    // get

    // create
    const newNotif: NotificationBasic = {
      type: 'team welcome',
      senderId: invite.teamId,
      recieverId: invite.inviteeId,
      date: admin.firestore.Timestamp.fromDate(new Date()),
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
    allPromises.push(db.collection('teams/' + invite.teamId + '/additionalInfo').doc('members').update({
      memCount: firestore.FieldValue.increment(1),
      members: firestore.FieldValue.arrayUnion(newMember),
    }));
    allPromises.push(db.collection('players').doc(invite.inviteeId).update({
      team: {
        name: invite.teamName,
        id: invite.teamId,
      },
    }));
    allPromises.push(db.collection('players/' + invite.inviteeId + '/Notifications').add(newNotif));
    allPromises.push(DeleteNotifById(inviteId, invite.inviteeId));
    allPromises.push(DeleteInviteById(inviteId));
    // update

    return await Promise.all(allPromises);
  } catch (error) {
    return error;
  }
}
export async function onRejectTeam(notifId: string, pid: string): Promise<any> {
  return DeleteNotifById(notifId, pid);
}
export async function DeleteInviteById(invId: string): Promise<any> {
  return await db.collection('invites').doc(invId).delete();
}
export async function DeleteNotifById(notifId: string, playerId: string): Promise<any> {
  // notif id for team invites is same as invites id
  return await db.collection('players/' + playerId + '/Notifications').doc(notifId).delete();
}
export async function SendJoinNotification(notif: NotificationBasic, recieverId: string, notifId: string): Promise<any> {
  return await db.collection('players/' + recieverId + '/Notifications').doc(notifId).set(notif);
}
export async function getParticipants(sid: string): Promise<SeasonParticipants[]> {
  return (await db.collection('seasons').doc(sid).collection('participants').get()).docs.map((doc) => doc.data() as SeasonParticipants);
}
export async function assignParticipants(season: SeasonBasicInfo, participant: any): Promise<any> {
  const sid = season.id || '';
  const participants = (await getParticipants(sid));
  const participantCount = participants ? participants.length : 0;
  if (participantCount < season.p_teams) {
    return db.collection('seasons').doc(sid).collection('participants').add(participant);
  }
}

import * as admin from 'firebase-admin';
let db = admin.firestore();
import { firestore } from 'firebase-admin';
import {
  Invite,
  NotificationBasic,
} from '../../src/app/shared/interfaces/notification.model';
import { SeasonParticipants } from '../../src/app/shared/interfaces/season.model';
import { Tmember } from '../../src/app/shared/interfaces/team.model';
import { PlayerBasicInfo } from '../../src/app/shared/interfaces/user.model';

export async function onJoinTeam(invite: Invite, inviteId: string) {
  try {
    //get
    const playerSnap: PlayerBasicInfo = <PlayerBasicInfo>(
      (await db.collection('players').doc(invite.inviteeId).get()).data()
    );
    //get

    //create
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

    //create

    //update
    let allPromises: any[] = [];
    allPromises.push(
      db
        .collection('teams/' + invite.teamId + '/additionalInfo')
        .doc('members')
        .update({
          memCount: firestore.FieldValue.increment(1),
          members: firestore.FieldValue.arrayUnion(newMember),
        })
    );
    allPromises.push(
      db
        .collection('players')
        .doc(invite.inviteeId)
        .update({
          team: {
            name: invite.teamName,
            id: invite.teamId,
          },
        })
    );
    allPromises.push(
      db
        .collection('players/' + invite.inviteeId + '/Notifications')
        .add(newNotif)
    );
    allPromises.push(DeleteNotifById(inviteId, invite.inviteeId));
    allPromises.push(DeleteInviteById(inviteId));
    //update

    console.log('Team Joined');
    return await Promise.all(allPromises);
  } catch (error) {
    console.log(error);
    return error;
  }
}
export async function onRejectTeam(notifId: string, pid: string) {
  return DeleteNotifById(notifId, pid);
}
export async function DeleteInviteById(invId: string) {
  return await db.collection('invites').doc(invId).delete();
}
export async function DeleteNotifById(notifId: string, playerId: string) {
  //notif id for team invites is same as invites id
  return await db
    .collection('players/' + playerId + '/Notifications')
    .doc(notifId)
    .delete();
}
export async function SendJoinNotification(
  notif: NotificationBasic,
  recieverId: string,
  notifId: string
) {
  return await db
    .collection('players/' + recieverId + '/Notifications')
    .doc(notifId)
    .set(notif);
}
export function getTimeslots(arr: number[], gap: number) {
  for (let i = 0; i < arr.length; i++) {
    let el = arr[i] + gap;
    if (arr.includes(el)) {
      let elIndex = arr.findIndex((a) => {
        return a == el;
      });
      let diff = Math.abs(i - elIndex);
      if (diff > 1) arr.splice(i + 1, diff - 1);
    } else {
      if (arr[i + 1] == arr[i] + 1 && arr[i + 2] == arr[i] + 2)
        arr.splice(i + 1, 2);
      else if (arr[i + 1] == arr[i] + 1 || arr[i + 1] == arr[i] + 2)
        arr.splice(i + 1, 1);
    }
  }
  //can be optimised further here
  return arr;
}
export async function getParticipants(sid: string) {
  return (
    await db.collection('seasons').doc(sid).collection('participants').get()
  ).docs.map((doc) => <SeasonParticipants>doc.data());
}
export function getRotatedTeams(ar: SeasonParticipants[]) {
  let newParticipants: SeasonParticipants[] = [];
  newParticipants.push(...ar);
  for (let i = 0; i < ar.length - 2; i++) {
    let second = ar[1];
    for (let j = 1; j < ar.length; j++) ar[j] = ar[j + 1];
    ar.splice(ar.length - 1, 1, second);
    newParticipants.push(...ar);
  }
  return newParticipants;
}

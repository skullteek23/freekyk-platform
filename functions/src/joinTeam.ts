import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { NotificationBasic } from '@shared/interfaces/notification.model';
import { TeamBasicInfo, Tmember } from '@shared/interfaces/team.model';
import { PlayerBasicInfo } from '@shared/interfaces/user.model';

const db = admin.firestore();

export async function teamJoin(data: { teamID: string, playerID: string }, context: any): Promise<any> {

  const playerDetails = (await db.collection('players').doc(data.playerID).get()).data() as PlayerBasicInfo;
  playerDetails
  const teamDetails = (await db.collection('teams').doc(data.teamID).get()).data() as TeamBasicInfo;

  if (!playerDetails || !teamDetails) {
    throw new functions.https.HttpsError('invalid-argument', `Error Occurred! Either team or player doesn't exist!`);
  } else if (!playerDetails.imgpath_sm || !playerDetails.pl_pos) {
    throw new functions.https.HttpsError('failed-precondition', 'Incomplete profile');
  } else if (teamDetails.captainId === data.playerID) {
    throw new functions.https.HttpsError('failed-precondition', `You are already this team's captain!`);
  } else if (playerDetails.team !== null) {
    throw new functions.https.HttpsError('failed-precondition', 'Player is already in a team');
  } else {
    const batch = db.batch();
    const playerNotification: NotificationBasic = {
      type: 2,
      senderID: data.teamID,
      senderName: teamDetails.tname,
      parentID: data.teamID,
      receiverID: data.playerID,
      date: new Date().getTime(),
      read: 0,
      expire: 0,
      receiverName: playerDetails.name
    };
    const teamMember: Tmember = {
      id: data.playerID,
      name: playerDetails.name,
      pl_pos: playerDetails.pl_pos,
      imgpath_sm: playerDetails.imgpath_sm,
    }
    const playerUpdate: Partial<PlayerBasicInfo> = {
      team: {
        id: data.teamID,
        name: teamDetails.tname,
        capId: teamDetails.captainId
      }
    }
    const captainNotification: NotificationBasic = {
      type: 6,
      senderID: data.playerID,
      senderName: playerDetails.name,
      receiverID: teamDetails.captainId,
      date: new Date().getTime(),
      read: 0,
      expire: 0,
      receiverName: teamDetails.tname
    }

    const memberRef = db.collection('teams').doc(data.teamID).collection('additionalInfo').doc('members');
    const playerRef = db.collection('players').doc(data.playerID);
    const notificationRef = db.collection('notifications').doc();
    const notificationRef2 = db.collection('notifications').doc();

    batch.update(playerRef, { ...playerUpdate });
    batch.update(memberRef, {
      memCount: admin.firestore.FieldValue.increment(1),
      members: admin.firestore.FieldValue.arrayUnion(teamMember),
    });
    batch.create(notificationRef, playerNotification);
    batch.create(notificationRef2, captainNotification);

    return batch.commit();
  }
}

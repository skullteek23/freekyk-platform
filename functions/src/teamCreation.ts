import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { TeamBasicInfo, TeamMoreInfo, Tmember, TeamMembers, allowedAgeCategories } from '@shared/interfaces/team.model';
import { PlayerBasicInfo, PlayerMoreInfo } from '@shared/interfaces/user.model';
import { NotificationBasic } from '@shared/interfaces/notification.model';
import { getRandomString, PLACEHOLDER_TEAM_LOGO, PLACEHOLDER_TEAM_PHOTO } from './utils/utilities';

const db = admin.firestore();

export async function teamCreation(data: { players: PlayerBasicInfo[], teamName: string, captainID: string, imgpath?: string, logo?: string }, context: any) {

  const logo = data.logo ? data.logo : PLACEHOLDER_TEAM_LOGO;
  const imgpath = data.imgpath ? data.imgpath : PLACEHOLDER_TEAM_PHOTO;
  const position = 'NA';
  const captainID = data && data.captainID ? data.captainID : null;
  const teamName = data && data.teamName ? data.teamName.trim() : null;
  let teamInfo: TeamBasicInfo;
  let teamMoreInfo: TeamMoreInfo;
  let tMembers: TeamMembers;

  if (logo && imgpath && position && captainID && teamName) {
    const captainInfo = (await db.collection('players').doc(captainID).get()).data() as PlayerBasicInfo;
    const birthDate = ((await db.collection(`players/${captainID}/additionalInfo`).doc('otherInfo').get()).data() as PlayerMoreInfo)?.born || 0;
    const captainAge = getAge(birthDate);
    if (!captainInfo.imgpath_sm || !captainInfo.pl_pos || !captainAge) {
      throw new functions.https.HttpsError('failed-precondition', 'Incomplete profile');
    } else if (captainInfo.team !== null) {
      throw new functions.https.HttpsError('invalid-argument', 'You are already in a team!');
    } else {
      const membersList: Tmember[] = [{
        id: captainID,
        name: captainInfo.name,
        pl_pos: captainInfo.pl_pos ? captainInfo.pl_pos : position,
        imgpath_sm: captainInfo.imgpath_sm ? captainInfo.imgpath_sm : null,
      }];

      teamInfo = {
        tname: teamName,
        isVerified: true,
        imgpath: imgpath,
        imgpath_logo: logo,
        captainId: captainID,
        captainName: captainInfo.name
      };
      teamMoreInfo = {
        tdateCreated: new Date().getTime(),
        tageCat: calculateAppropriateAgeGroup(captainAge),
        captainName: captainInfo.name,
      };
      tMembers = {
        memCount: 1,
        members: membersList,
      };

      const teamID = getRandomString(12);
      const teamRef = db.collection('teams').doc(teamID);
      const teamInfoRef = db.collection(`teams/${teamID}/additionalInfo`).doc('moreInfo');
      const teamMemberRef = db.collection(`teams/${teamID}/additionalInfo`).doc('members');
      const captainRef = db.collection('players').doc(captainID);
      const batch = db.batch();

      batch.create(teamRef, teamInfo);
      batch.create(teamInfoRef, teamMoreInfo);
      batch.create(teamMemberRef, tMembers);
      batch.update(captainRef, { team: { name: teamName, id: teamID, capId: captainID } });

      for (let i = 0; i < data.players.length; i++) {
        const player = data.players[i];
        if (player.id) {
          const notificationRef = db.collection('notifications').doc();
          const notification: NotificationBasic = {
            read: 0,
            senderID: teamID,
            senderName: teamName,
            receiverID: player.id,
            date: new Date().getTime(),
            type: 1,
            expire: 0,
            receiverName: player.name
          }
          batch.create(notificationRef, notification);
        }
      }

      return batch.commit();
    }
  }
  return false;
}

export function getAge(birth: number) {
  if (!birth) {
    return null;
  }
  const diffInMilliseconds = Date.now() - birth;
  const ageDate = new Date(diffInMilliseconds);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function calculateAppropriateAgeGroup(comparator: number) {
  let start = 0;
  for (let i = 0; i < allowedAgeCategories.length; i++) {
    if (comparator <= allowedAgeCategories[i].value) {
      start = allowedAgeCategories[i].value;
      break;
    }
  }
  return start;
}


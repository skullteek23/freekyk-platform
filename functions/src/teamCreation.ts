import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { TeamBasicInfo, TeamMoreInfo, Tmember, TeamMembers } from '@shared/interfaces/team.model';
import { PlayerBasicInfo } from '@shared/interfaces/user.model';
import { Invite } from '@shared/interfaces/notification.model';
import { PLACEHOLDER_TEAM_LOGO, PLACEHOLDER_TEAM_PHOTO } from './utils/utilities';

const db = admin.firestore();

export async function teamCreation(data: { players: PlayerBasicInfo[], teamName: string, captainID: string, imgpath?: string, logo?: string }, context: any) {

  const logo = data.logo ? data.logo : PLACEHOLDER_TEAM_LOGO;
  const imgpath = data.imgpath ? data.imgpath : PLACEHOLDER_TEAM_PHOTO;
  const position = 'NA';
  const captainID = data && data.captainID ? data.captainID : null;
  const teamData = data && data.teamName ? data.teamName : null;
  let teamInfo: TeamBasicInfo;
  let teamMoreInfo: TeamMoreInfo;
  let tMembers: TeamMembers;

  if (logo && imgpath && position && captainID && teamData) {
    const captainInfo = (await db.collection('players').doc(captainID).get()).data() as PlayerBasicInfo;
    if (captainInfo.team !== null) {
      throw new functions.https.HttpsError('invalid-argument', 'Error Occurred! Please try again later');
    }
    const membersList: Tmember[] = [{
      id: captainID,
      name: captainInfo.name,
      pl_pos: captainInfo.pl_pos ? captainInfo.pl_pos : position,
      imgpath_sm: captainInfo.imgpath_sm ? captainInfo.imgpath_sm : null,
    }];

    teamInfo = {
      tname: teamData,
      isVerified: true,
      imgpath: imgpath,
      imgpath_logo: logo,
      captainId: captainID,
    };
    teamMoreInfo = {
      tdateCreated: new Date().getTime(),
      tageCat: 30,
      captainName: captainInfo.name,
    };
    tMembers = {
      memCount: 1,
      members: membersList,
    };

    const teamRef = db.collection('teams').doc(teamData);
    const teamInfoRef = db.collection(`teams/${teamData}/additionalInfo`).doc('moreInfo');
    const teamMemberRef = db.collection(`teams/${teamData}/additionalInfo`).doc('members');
    const captainRef = db.collection('players').doc(captainID);
    const batch = db.batch();

    batch.create(teamRef, teamInfo);
    batch.create(teamInfoRef, teamMoreInfo);
    batch.create(teamMemberRef, tMembers);
    batch.update(captainRef, { team: { name: teamData, id: teamData, capId: captainID } });

    for (let i = 0; i < data.players.length; i++) {
      const player = data.players[i];
      if (player.id) {
        const inviteRef = db.collection('invites').doc();
        const invite: Invite = {
          teamId: teamData,
          teamName: teamData,
          inviteeId: player.id,
          inviteeName: player.name,
          status: 'wait',
        }
        batch.create(inviteRef, invite);
      }
    }

    return batch.commit();
  }
  return false;
}


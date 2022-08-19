/* eslint-disable */
import * as admin from 'firebase-admin';
import { Invite } from '../../src/app/shared/interfaces/notification.model';
import { ActiveSquadMember, TeamMembers } from '../../src/app/shared/interfaces/team.model';

const db = admin.firestore();

export async function onDelete(data: { teamId: string }, context: any): Promise<any> {

  const TEAM_COMMUNICATION_MAX_LIMIT = 3;
  const teamID = data && data.teamId ? data.teamId : null;
  const batch = db.batch();
  const basicInfoRefs: any[] = []
  const memberRefs: any[] = [];
  const teamCommunicationsRefs: any[] = [];
  const teamInviteRefs: any[] = []
  let teamInfoPath = '';
  let teamCommunicationPath = '';
  let memberIDs: TeamMembers;

  if (teamID) {
    teamInfoPath = `teams/${teamID}/additionalInfo`;
    teamCommunicationPath = `teamCommunications/${teamID}/activeSquad`;
    memberIDs = (await db.collection(teamInfoPath).doc('members').get()).data() as TeamMembers;

    if (memberIDs && memberIDs.members && memberIDs.members.length) {
      const invites = (await db.collection('invites').where('teamId', '==', teamID).get()).docs;

      basicInfoRefs.push(db.collection('teams').doc(teamID));
      basicInfoRefs.push(db.collection(teamInfoPath).doc('moreInfo'));
      basicInfoRefs.push(db.collection(teamInfoPath).doc('members'));
      basicInfoRefs.push(db.collection(teamInfoPath).doc('statistics'));
      basicInfoRefs.push(db.collection(teamInfoPath).doc('media'));

      memberIDs.members.forEach(member => {
        memberRefs.push(db.collection('players').doc(member.id));
      });

      for (let i = 0; i < TEAM_COMMUNICATION_MAX_LIMIT; i++) {
        const fullPath = teamCommunicationPath + i.toString();
        const data = (await db.collection(fullPath).get()).docs;
        if (data.length && fullPath) {
          const dataTemp: ActiveSquadMember[] = data.map((resp) => resp.data() as ActiveSquadMember);
          dataTemp.forEach(element => {
            const id = element && element.id ? element.id : '';
            teamCommunicationsRefs.push(db.collection(fullPath).doc(id));
          })
        }
      }

      if (invites.length) {
        const tempInvites = invites.map((doc) => ({ id: doc.id, ...(doc.data() as Invite) } as Invite));
        tempInvites.forEach(invite => {
          const id = invite && invite.id ? invite.id : '';
          teamInviteRefs.push(db.collection('invites').doc(id));
        })
      }
    }
  }

  if (basicInfoRefs.length && memberRefs.length) {
    basicInfoRefs.forEach(element => {
      batch.delete(element);
    });
    memberRefs.forEach(element => {
      batch.update(element, { team: null });
    });
    teamCommunicationsRefs.forEach(element => {
      batch.delete(element);
    });
    teamInviteRefs.forEach(element => {
      batch.delete(element);
    });
    return batch.commit();
  }

  return false;
}

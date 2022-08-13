/* eslint-disable */
import * as admin from 'firebase-admin';
const db = admin.firestore();
import { Invite } from '../../src/app/shared/interfaces/notification.model';
import {
  ActiveSquadMember,
  TeamMembers,
} from '../../src/app/shared/interfaces/team.model';
export async function teamDeleter(
  data: { teamId: string },
  context: any
): Promise<any> {
  // initiating the main batch for deletion and updation
  const batch = db.batch();
  // initiating the main batch for deletion and updation

  // updating team members individual profile
  const memSnap: string[] = (
    (
      await db
        .collection('teams')
        .doc(data.teamId)
        .collection('additionalInfo')
        .doc('members')
        .get()
    ).data() as TeamMembers
  ).members.map((mem) => mem.id);
  // tslint:disable: prefer-for-of
  for (let i = 0; i < memSnap.length; i++) {
    const plRef = db.collection('players').doc(memSnap[i]);
    batch.update(plRef, { team: null });
  }
  // updating team members individual profile

  // deleting team info
  const teamRef = db.collection('teams').doc(data.teamId);
  batch.delete(teamRef);
  // deleting team info

  // deleting team additional info
  const teamMoreref = db
    .collection('teams/' + data.teamId + '/additionalInfo')
    .doc('moreInfo');
  batch.delete(teamMoreref);
  // deleting team additional info

  // deleting team members info
  const teamMemRef = db
    .collection('teams/' + data.teamId + '/additionalInfo')
    .doc('members');
  batch.delete(teamMemRef);
  // deleting team members info

  // deleting team statistics info
  const teamStatsRef = db
    .collection('teams/' + data.teamId + '/additionalInfo')
    .doc('statistics');
  batch.delete(teamStatsRef);
  // deleting team statistics info

  // deleting team media info
  const teamMediaRef = db
    .collection('teams/' + data.teamId + '/additionalInfo')
    .doc('media');
  batch.delete(teamMediaRef);
  // deleting team media info

  // checking is team comms for Upcoming Match 1 exists and if so then deleting all members in it
  const isTCAEmpty = (
    await db
      .collection('teamCommunications/' + data.teamId + '/activeSquad0')
      .get()
  ).empty;
  if (!isTCAEmpty) {
    const commsA = (
      await db
        .collection('teamCommunications/' + data.teamId + '/activeSquad0')
        .get()
    ).docs.map((resp) => resp.data() as ActiveSquadMember);
    for (let i = 0; i < commsA.length; i++) {
      const plRef = db
        .collection('teamCommunications/' + data.teamId + '/activeSquad0')
        .doc(commsA[i].id);
      batch.delete(plRef);
    }
  }
  // checking is team comms for Upcoming Match 1 exists and if so then deleting all members in it

  // checking is team comms for Upcoming Match 2 exists and if so then deleting all members in it
  const isTCBEmpty = (
    await db
      .collection('teamCommunications/' + data.teamId + '/activeSquad1')
      .get()
  ).empty;
  if (!isTCBEmpty) {
    const commsB = (
      await db
        .collection('teamCommunications/' + data.teamId + '/activeSquad1')
        .get()
    ).docs.map((resp) => resp.data() as ActiveSquadMember);
    for (let i = 0; i < commsB.length; i++) {
      const plRef = db
        .collection('teamCommunications/' + data.teamId + '/activeSquad1')
        .doc(commsB[i].id);
      batch.delete(plRef);
    }
  }
  // checking is team comms for Upcoming Match 2 exists and if so then deleting all members in it

  // checking is team comms for Upcoming Match 3 exists and if so then deleting all members in it
  const isTCCEmpty = (
    await db
      .collection('teamCommunications/' + data.teamId + '/activeSquad2')
      .get()
  ).empty;
  if (!isTCCEmpty) {
    const commsC = (
      await db
        .collection('teamCommunications/' + data.teamId + '/activeSquad2')
        .get()
    ).docs.map((resp) => resp.data() as ActiveSquadMember);
    for (let i = 0; i < commsC.length; i++) {
      const plRef = db
        .collection('teamCommunications/' + data.teamId + '/activeSquad2')
        .doc(commsC[i].id);
      batch.delete(plRef);
    }
  }
  // checking is team comms for Upcoming Match 3 exists and if so then deleting all members in it

  // checking for any team invites and deleting them
  const isInvitesEmpty = (
    await db.collection('invites').where('teamId', '==', data.teamId).get()
  ).empty;
  if (!isInvitesEmpty) {
    const invites: Invite[] = (
      await db.collection('invites').where('teamId', '==', data.teamId).get()
    ).docs.map((doc) => ({ id: doc.id, ...(doc.data() as Invite) } as Invite));
    for (let i = 0; i < invites.length; i++) {
      const invRef = db.collection('invites').doc(String(invites[i].id));
      batch.delete(invRef);
    }
  }
  // checking for any team invites and deleting them

  return batch.commit();
}

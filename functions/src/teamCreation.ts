import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { AGE_CATEGORY, ITeam, ITeamMembers } from '@shared/interfaces/team.model';
import { IPlayer, IPlayerMore } from '@shared/interfaces/user.model';
import { getRandomString } from './utils/utilities';

const db = admin.firestore();

export async function teamCreation(data: { name: string, captainID: string }, context: any) {

  const captainID = data && data.captainID ? data.captainID : null;
  const teamName = data && data.name ? data.name.trim() : null;
  let teamInfo: Partial<ITeam>;
  let tMembers: Partial<ITeamMembers> = {};

  if (captainID && teamName) {
    const captainInfo = (await db.collection('players').doc(captainID).get()).data() as IPlayer;
    const captainMoreInfo = ((await db.collection(`players/${captainID}/additionalInfo`).doc('otherInfo').get()).data() as IPlayerMore);

    // Exit if player has incomplete profile
    if (!captainInfo || !captainInfo.locCity || !captainInfo.position || !captainInfo.imgpath || !captainMoreInfo) {
      throw new functions.https.HttpsError('failed-precondition', 'Incomplete profile');
    }

    const captainAge = getAge(captainInfo.born);

    teamInfo = {
      name: teamName,
      captain: {
        id: captainID,
        name: captainInfo.name,
      },
      locCity: captainInfo.locCity,
      locState: captainInfo.locState,
      tdateCreated: new Date().getTime(),
      tageCat: calculateAppropriateAgeGroup(captainAge)
    }

    tMembers.members = [];
    tMembers.members.push(captainID);

    const playerUpdate: Partial<IPlayer> = {};

    const teamID = getRandomString(12);

    const teamRef = db.collection('teams').doc(teamID);
    const teamMemberRef = db.collection(`teamMembers`).doc(teamID);

    const captainRef = db.collection('players').doc(captainID);
    const batch = db.batch();

    batch.create(teamRef, teamInfo);
    batch.create(teamMemberRef, tMembers);

    playerUpdate.teamID = teamID;
    batch.update(captainRef, { ...playerUpdate });

    await batch.commit();

    return teamID;
  }
  throw new functions.https.HttpsError('invalid-argument', 'Error Occurred! Please try again!');
}

export function getAge(birth: number) {
  const diffInMilliseconds = Date.now() - birth;
  const ageDate = new Date(diffInMilliseconds);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function calculateAppropriateAgeGroup(comparator: number): AGE_CATEGORY {
  const allowedAgeCategories: AGE_CATEGORY[] = [15, 16, 19, 23, 99];
  let start: AGE_CATEGORY = 15;
  for (let i = 0; i < allowedAgeCategories.length; i++) {
    if (comparator <= allowedAgeCategories[i]) {
      start = allowedAgeCategories[i];
      break;
    }
  }
  return start;
}


import * as admin from 'firebase-admin';
import { Invite, NotificationBasic } from '../../../src/app/shared/interfaces/notification.model';
import { SeasonBasicInfo, SeasonParticipants } from '../../../src/app/shared/interfaces/season.model';
import { MatchFixture } from '../../../src/app/shared/interfaces/match.model';
import { Tmember } from '../../../src/app/shared/interfaces/team.model';
import { PlayerBasicInfo } from '../../../src/app/shared/interfaces/user.model';

const db = admin.firestore();

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

export async function assignSeasonParticipants(season: SeasonBasicInfo, participant: SeasonParticipants): Promise<any> {
  const sid = season.id || '';
  const seasonName = season.name || '';
  const seasonFixturesData = (await db.collection('allMatches').where('season', '==', seasonName).get()).docs;

  const fixtures: any[] = [];
  const selectedFixtures: MatchFixture[] = [];
  const value = {
    name: participant.tname,
    logo: participant.tlogo
  }
  const allPromises: any[] = [];
  const matchIDs: string[] = [];
  if (!seasonFixturesData.length) {
    return false;
  }
  seasonFixturesData.forEach(element => {
    const id = element.id;
    const fixtureData = element.data() as MatchFixture;
    const date = fixtureData.date;
    fixtures.push({ ...fixtureData, id, date });
  });
  fixtures.sort(sortObjectByKey('date'));
  fixtures.some(element => {
    if (element.hasOwnProperty('type') && element.type === 'FCP' && (element.home.name === 'TBD' || element.away.name === 'TBD')) {
      matchIDs.push(element['id']);
      return true;
    }
    return false;
  })
  fixtures.some(element => {
    if (element.hasOwnProperty('type') && element.type === 'FKC' && (element.home.name === 'TBD' || element.away.name === 'TBD')) {
      matchIDs.push(element['id']);
      return true;
    }
    return false;
  })
  fixtures.some(element => {
    if (element.hasOwnProperty('type') && element.type === 'FPL' && (element.home.name === 'TBD' || element.away.name === 'TBD')) {
      matchIDs.push(element['id']);
      return true;
    }
    return false;
  })
  matchIDs.forEach(matchID => {
    const tempFixture: any = fixtures.find(fixture => fixture.id === matchID);
    if (tempFixture) {
      selectedFixtures.push({ id: matchID, ...tempFixture as MatchFixture });
    }
  });
  selectedFixtures.forEach(fixture => {
    const id = fixture.id || '';
    if (fixture.home.name === 'TBD') {
      allPromises.push(db.collection('allMatches').doc(id).update({
        home: value,
        teams: admin.firestore.FieldValue.arrayUnion(value.name)
      }));
    } else if (fixture.away.name === 'TBD') {
      allPromises.push(db.collection('allMatches').doc(id).update({
        away: value,
        teams: admin.firestore.FieldValue.arrayUnion(value.name)
      }));
    }
  })

  if (!allPromises.length) {
    return false;
  }
  allPromises.push(db.collection(`seasons/${sid}/participants`).add(participant));
  return Promise.all(allPromises);
}

export function sortObjectByKey(key: string, order = 'asc', isConvertNA = true): any {
  return function innerSort(a: any, b: any) {
    const isTypescriptProperty = key in a || key in b;
    if (isTypescriptProperty || a.hasOwnProperty(key) || b.hasOwnProperty(key)) {
      if (Array.isArray(a[key])) {
        const valueA = a[key].join(", ").toUpperCase();
        const valueB = b[key].join(", ").toUpperCase();
        return getSortedElement(valueA, valueB, order);
      } else {
        let valueA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
        let valueB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];
        if (isConvertNA) {
          valueA = !valueA || valueA === 'N/A' ? null : valueA;
          valueB = !valueB || valueB === 'N/A' ? null : valueB;
        } else {
          valueA = !valueA ? null : valueA;
          valueB = !valueB ? null : valueB;
        }
        return getSortedElement(valueA, valueB, order);
      }
    }
    // property doesn't exist on either object
    return 0;
  }
}

export function getSortedElement(valueA: any, valueB: any, order: string) {
  let comparison = 0;
  if (valueB === null) {
    comparison = 1;
  } else if (valueA === null) {
    comparison = -1;
  } else if (valueA > valueB) {
    comparison = 1;
  } else if (valueA < valueB) {
    comparison = -1;
  }
  return order === 'desc' ? comparison * -1 : comparison;
}

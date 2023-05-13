import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { MatchFixture } from '@shared/interfaces/match.model';
import { AdminConfigurationSeason } from '@shared/interfaces/admin.model';
import { ISeason, ISeasonDescription } from '@shared/interfaces/season.model';
import { ONE_DAY_IN_MILLIS } from './utils/utilities';
const db = admin.firestore();

export async function seasonPublish(data: any, context: any): Promise<any> {
  if (!data || Object.keys(data).length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Error Occurred! Please try again later');
  }
  const fixtures: MatchFixture[] = data.fixtures;
  const firstFixtureTimestamp = fixtures[0].date;
  const adminConfig = ((await db.collection('adminConfigs').doc('season').get()).data() as AdminConfigurationSeason)?.lastParticipationDate;

  if (!fixtures || !fixtures.length) {
    throw new functions.https.HttpsError('invalid-argument', 'Error Occurred! Please try again later');
  }

  const season: Partial<ISeason> = {};
  season.name = data.name.trim();
  season.city = data.location.city.trim();
  season.state = data.location.state.trim();
  season.fees = Number(data.fees);
  season.type = data.type;
  season.startDate = new Date(data.startDate).getTime();
  season.ageCategory = data.ageCategory;
  season.status = 'PUBLISHED';
  season.createdBy = data.uid;
  season.participatingTeams = Number(data.participatingTeams);

  if (adminConfig) {
    season.lastRegistrationDate = decideLastDateRegistration(firstFixtureTimestamp, adminConfig);
  }

  addPropertyToMore('leftOverMatchCount', data, season);
  addPropertyToMore('imgpath', data, season);
  addPropertyToMore('format', data, season);
  addPropertyToMore('groundName', data, season);
  addPropertyToMore('groundLink', data, season);

  // season info
  const batch = db.batch();
  const seasonRef = db.collection('seasons').doc(data.seasonID);
  batch.set(seasonRef, season);


  if (data.description) {
    const about: ISeasonDescription = {
      description: data?.description.trim()
    };

    const seasonMoreRef = db.collection('seasonMoreInfo').doc(data.seasonID);
    batch.set(seasonMoreRef, about);
  }

  // When participants are pre-selected, save allowed participants
  // if (data?.teams?.participants?.length > 0) {
  //   about.allowedParticipants = data?.teams?.participants.map(p => p.id);
  // }

  // ground slot booking
  // const groundsList = data.grounds.filter(ground => ground.slots.length);
  // groundsList.forEach(ground => {
  //   ground.slots.forEach(slot => {
  //     const booking: GroundBooking = {
  //       by: data.adminID,
  //       slotTimestamp: slot,
  //       groundID: ground.id,
  //       season: season.name
  //     }
  //     const bookingRef = db.collection('groundBookings').doc();
  //     batch.create(bookingRef, booking);
  //   })
  // })

  // Not configured for multiple leagues in a season
  // Posting empty league table if season contains league
  // if (season.type === 'FPL') {
  //   const emptyTable = getEmptyLeagueTable(data.seasonID, data.matchType.participatingTeamsCount);
  //   const tableRef = db.collection('leagues').doc(data.seasonID);
  //   if (emptyTable) {
  //     batch.set(tableRef, { ...emptyTable });
  //   }
  // }

  // Not configured for multiple knockout in a season
  // Setting up empty knockout stage matches if season contains knockout tournament
  // if (season.type === 'FKC') {
  //   const knockoutFixtures = fixtures.filter(el => el.type === 'FKC');
  //   knockoutFixtures.sort(sortObjectByKey('date'));
  //   const roundsList = getRoundsList(data.matchType.participatingTeamsCount);
  //   knockoutFixtures.map((fixture, index) => {
  //     const data: MatchFixture = fixture;
  //     data.fkcRound = roundsList[index] as KnockoutRounds;
  //     return data;
  //   })
  //   for (let i = 0; i < knockoutFixtures.length; i++) {
  //     const elementID = fixtures.findIndex((fixture) => fixture.id === knockoutFixtures[i].id);
  //     if (elementID > -1) {
  //       fixtures[elementID].fkcRound = knockoutFixtures[i].fkcRound;
  //     }
  //   }
  // }

  // Post publishable fixture(s)
  fixtures.forEach((element) => {
    const fixtureID = element.id;
    if (fixtureID) {
      const fixtureRef = db.collection('allMatches').doc(fixtureID);
      batch.set(fixtureRef, element);
    }
  });

  return batch.commit();
}

// export function getPublishableFixture(data: IDummyFixture[]) {
//   return data.map(val => ({
//     id: val.id,
//     date: val.date,
//     home: {
//       name: TO_BE_DECIDED,
//       logo: DEFAULT_LOGO
//     },
//     away: {
//       name: TO_BE_DECIDED,
//       logo: DEFAULT_LOGO
//     },
//     teams: [TO_BE_DECIDED],
//     season: val.season,
//     premium: val.premium,
//     status: 0,
//     type: val.type,
//     ground: val.ground,
//     groundID: val.groundID
//   } as MatchFixture));
// }

// export function getEmptyLeagueTable(seasonID: string, teamsCount: number): LeagueTableModel[] {
//   if (seasonID && teamsCount) {
//     const table: LeagueTableModel[] = [];
//     for (let i = 0; i < teamsCount; i++) {
//       table.push({
//         tData: { logo: DEFAULT_LOGO, name: TO_BE_DECIDED },
//         w: 0,
//         d: 0,
//         l: 0,
//         gf: 0,
//         ga: 0,
//       });
//     }
//     return table;
//   }
//   return [];
// }

// export function getRoundsList(totalTeams: number): number[] {
//   const roundsList: number[] = [];
//   for (let i = totalTeams; i >= 2; i /= 2) {
//     for (let j = i; j > i / 2; j--) {
//       roundsList.push(i);
//     }
//   }
//   return roundsList;
// }

export function decideLastDateRegistration(startDate: number, option: string): number {
  switch (option) {
    case 'Same as Tournament Start Date':
      return startDate;
    case '1 day before Start Date':
      return startDate - ONE_DAY_IN_MILLIS;
    case '3 days before Start Date':
      return startDate - (3 * ONE_DAY_IN_MILLIS)
    case '1 week before Start Date':
      return startDate - (7 * ONE_DAY_IN_MILLIS)
    default:
      return startDate;
  }
}

export function addPropertyToMore(property: string, checkerObj: any, obj: any) {
  if (checkerObj.hasOwnProperty(property)) {
    if (!obj.hasOwnProperty('more')) {
      obj.more = {};
      obj.more[property] = checkerObj[property];
    } else {
      obj.more[property] = checkerObj[property];
    }
  }
}

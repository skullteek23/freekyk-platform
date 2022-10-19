import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { GroundBooking, GroundPrivateInfo } from '../../src/app/shared/interfaces/ground.model';
import { dummyFixture, MatchFixture } from '../../src/app/shared/interfaces/match.model';
import { LeagueTableModel } from '../../src/app/shared/interfaces/others.model';
import { SeasonBasicInfo, SeasonAbout, SeasonDraft } from '../../src/app/shared/interfaces/season.model';
import { Constants, sortObjectByKey } from './utils/utilities';
const db = admin.firestore();

export async function seasonPublish(data: any, context: any): Promise<any> {
  if (!data || !data.hasOwnProperty('seasonDraft') || !data.hasOwnProperty('fixturesDraft') || !data.hasOwnProperty('lastRegTimestamp')) {
    throw new functions.https.HttpsError('invalid-argument', 'Error Occurred! Please try again later');
  }
  const draftFixtures = data['fixturesDraft'] as dummyFixture[];
  const draftSeason = data['seasonDraft'] as SeasonDraft;
  const startDate = draftFixtures[0].date;
  const endDate = draftFixtures[draftFixtures.length - 1].date;
  const fixtures: MatchFixture[] = getPublishableFixture(draftFixtures);
  const totalTeams = Number(draftSeason.basicInfo['participatingTeamsCount']);

  if (!fixtures || !fixtures.length || !totalTeams) {
    throw new functions.https.HttpsError('invalid-argument', 'Error Occurred! Please try again later');
  }

  // Checking if ground(s) is available or not
  if (draftSeason.grounds && await isAnyGroundBooked(draftSeason.grounds, startDate, endDate)) {
    throw new functions.https.HttpsError('failed-precondition', 'Sorry! One or more grounds you selected is already booked!');
  }

  const season: SeasonBasicInfo = {
    name: draftSeason.basicInfo?.name,
    imgpath: draftSeason.basicInfo?.imgpath,
    locCity: draftSeason.basicInfo?.city,
    locState: draftSeason.basicInfo?.state,
    premium: true,
    p_teams: draftSeason.basicInfo?.participatingTeamsCount,
    start_date: draftSeason.basicInfo?.startDate,
    cont_tour: draftSeason.basicInfo?.containingTournaments,
    feesPerTeam: draftSeason.basicInfo?.fees,
    discount: draftSeason.basicInfo?.discount,
    lastRegDate: data['lastRegTimestamp'],
    status: 'PUBLISHED'
  };
  const seasonAbout: SeasonAbout = {
    description: draftSeason.basicInfo?.description,
    rules: draftSeason.basicInfo?.rules,
    paymentMethod: 'Online',
  };
  if (data['lastRegTimestamp'] !== season.start_date) {
    season['lastRegDate'] = data['lastRegTimestamp'];
  }

  // Post season info
  const batch = db.batch();
  const seasonRef = db.collection('seasons').doc(draftSeason.draftID);
  const seasonMoreRef = db.collection(`seasons/${draftSeason.draftID}/additionalInfo`).doc('moreInfo');
  batch.set(seasonRef, season);
  batch.set(seasonMoreRef, seasonAbout);

  // Update draft last updated time for admin panel
  const lastUpdated = new Date().getTime();
  const draftRef = db.collection(`seasonDrafts`).doc(draftSeason.draftID);
  batch.update(draftRef, { lastUpdated, status: season.status });


  // Book used ground(s)
  const groundIDList = (draftSeason.grounds as GroundPrivateInfo[]).map(gr => gr.id);
  for (let i = 0; i < groundIDList.length; i++) {
    const groundID = groundIDList[i];
    if (groundID) {
      const setRef = db.collection('groundBookings').doc(groundID);
      const booking: GroundBooking = { seasonID: draftSeason.draftID, groundID, bookingFrom: startDate, bookingTo: endDate };
      const existingBooking = (await db.collection('groundBookings').doc(groundID).get()).data() as GroundBooking;
      if (existingBooking && existingBooking.bookingFrom > startDate && existingBooking.bookingTo < endDate) {
        batch.update(setRef, { bookingFrom: startDate, bookingTo: endDate });
      } else if (existingBooking && existingBooking.bookingFrom <= startDate && existingBooking.bookingTo < endDate) {
        batch.update(setRef, { bookingTo: endDate });
      } else if (existingBooking && existingBooking.bookingFrom > startDate && existingBooking.bookingTo >= endDate) {
        batch.update(setRef, { bookingFrom: startDate });
      } else {
        batch.set(setRef, booking);
      }
    }
  }

  // Posting empty league table if season contains league
  // Not configured for multiple leagues in a season
  if (season.cont_tour.includes('FPL')) {
    const emptyTable = getEmptyLeagueTable(draftSeason.draftID, totalTeams);
    const tableRef = db.collection('leagues').doc(draftSeason.draftID);
    if (emptyTable) {
      batch.set(tableRef, { ...emptyTable });
    }
  }

  // Setting up empty knockout stage matches if season contains knockout tournament
  if (season.cont_tour.includes('FKC')) {
    const knockoutFixtures = fixtures.filter(el => el.type === 'FKC');
    knockoutFixtures.sort(sortObjectByKey('date'));
    const roundsList = getRoundsList(totalTeams);
    knockoutFixtures.map((fixture, index) => {
      const data = fixture;
      data.fkcRound = roundsList[index];
      return data;
    })
    for (let i = 0; i < knockoutFixtures.length; i++) {
      const elementID = fixtures.findIndex((fixture) => fixture.id === knockoutFixtures[i].id);
      if (elementID > -1) {
        fixtures[elementID].fkcRound = knockoutFixtures[i].fkcRound;
      }
    }
  }

  // Post publishable fixture(s)
  fixtures.forEach((element) => {
    const fixtureID = element.id;
    if (fixtureID) {
      const fixtureRef = db.collection('allMatches').doc(fixtureID);
      batch.set(fixtureRef, element);
    }
  });

  // Delete draft fixture(s)
  draftFixtures.forEach(element => {
    const draftFixtureID = element.id;
    if (draftFixtureID) {
      const draftRef = db.collection('seasonFixturesDrafts').doc(draftFixtureID);
      batch.delete(draftRef);
    }
  });

  return batch.commit();
}

export function getPublishableFixture(data: dummyFixture[]) {
  return data.map(val => ({
    id: val.id,
    date: val.date,
    concluded: false,
    home: {
      name: Constants.TO_BE_DECIDED,
      logo: Constants.DEFAULT_LOGO
    },
    away: {
      name: Constants.TO_BE_DECIDED,
      logo: Constants.DEFAULT_LOGO
    },
    teams: [Constants.TO_BE_DECIDED],
    season: val.season,
    premium: val.premium,
    type: val.type,
    locCity: val.locCity,
    locState: val.locState,
    stadium: val.stadium,
  } as MatchFixture));
}

export async function isAnyGroundBooked(grounds: GroundPrivateInfo[], startDate: number, endDate: number): Promise<boolean> {
  if (startDate && endDate) {
    for (let i = 0; i < grounds.length; i++) {
      const bookingsList: GroundBooking[] = (await getBookingsForGround(grounds[i])).docs.map(res => (res.data() as GroundBooking));
      if (!bookingsList.length) {
        continue;
      } else {
        return bookingsList.some(booking => isBookingOverlap(startDate, endDate, booking));
      }
    }
  }
  return false;
}

export function getEmptyLeagueTable(seasonID: string, teamsCount: number): LeagueTableModel[] {
  if (seasonID && teamsCount) {
    const table: LeagueTableModel[] = [];
    for (let i = 0; i < teamsCount; i++) {
      table.push({
        tData: { logo: Constants.DEFAULT_LOGO, name: Constants.TO_BE_DECIDED },
        w: 0,
        d: 0,
        l: 0,
        gf: 0,
        ga: 0,
      });
    }
    return table;
  }
  return [];
}

export function getBookingsForGround(ground: GroundPrivateInfo): Promise<FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>> {
  return db.collection('groundBookings').where('groundID', '==', ground['id']).get();
}

export function isBookingOverlap(startDate: number, endDate: number, booking: GroundBooking): boolean {
  return (startDate <= booking.bookingTo) && (booking.bookingFrom <= endDate);
}

export function getRoundsList(totalTeams: number): number[] {
  const roundsList: number[] = [];
  for (let i = totalTeams; i >= 2; i /= 2) {
    for (let j = i; j > i / 2; j--) {
      roundsList.push(i);
    }
  }
  return roundsList;
}

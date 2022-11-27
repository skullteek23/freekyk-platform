import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { IDummyFixture, KnockoutRounds, MatchFixture } from '@shared/interfaces/match.model';
import { LeagueTableModel } from '@shared/interfaces/others.model';
import { SeasonBasicInfo, SeasonAbout, ISeasonCloudFnData } from '@shared/interfaces/season.model';
import { DEFAULT_LOGO, sortObjectByKey, TO_BE_DECIDED } from './utils/utilities';
import { GroundBooking } from '@shared/interfaces/ground.model';
const db = admin.firestore();

export async function seasonPublish(data: ISeasonCloudFnData, context: any): Promise<any> {
  if (!data || Object.keys(data).length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Error Occurred! Please try again later');
  }
  const fixturesTemp = data.fixtures;
  const fixtures: MatchFixture[] = getPublishableFixture(fixturesTemp.fixtures);
  const firstFixtureTimestamp = fixtures[0].date;

  if (!fixtures || !fixtures.length || !data.grounds?.length) {
    throw new functions.https.HttpsError('invalid-argument', 'Error Occurred! Please try again later');
  }

  const lastUpdated = new Date().getTime();
  const season: SeasonBasicInfo = {
    name: data?.seasonDetails?.name,
    locCity: data?.matchType?.location?.city,
    locState: data?.matchType?.location?.state,
    premium: data?.grounds?.length !== 0 && data?.grounds[0].ownType === 'PRIVATE',
    p_teams: data?.matchType?.participatingTeamsCount,
    start_date: firstFixtureTimestamp,
    cont_tour: data?.matchType?.containingTournaments,
    feesPerTeam: data?.seasonDetails?.fees,
    discount: data?.seasonDetails?.discount,
    lastRegDate: new Date(data?.seasonDetails.lastRegistrationDate).getTime(),
    status: 'PUBLISHED',
    leftOverMatchCount: fixtures.length,
    lastUpdated,
    createdBy: data.adminID
  };
  const seasonAbout: SeasonAbout = {
    description: data?.seasonDetails?.description,
    rules: data?.seasonDetails?.rules,
    paymentMethod: 'Online',
  };

  // When participants are pre-selected, save allowed participants
  if (data?.teams?.participants?.length > 0) {
    seasonAbout.allowedParticipants = data?.teams?.participants.map(p => p.id);
  }

  // season info
  const batch = db.batch();
  const seasonRef = db.collection('seasons').doc(data.seasonID);
  const seasonMoreRef = db.collection(`seasons/${data.seasonID}/additionalInfo`).doc('moreInfo');
  batch.set(seasonRef, season);
  batch.set(seasonMoreRef, seasonAbout);

  // ground slot booking
  const groundsList = data.grounds.filter(ground => ground.slots.length);
  groundsList.forEach(ground => {
    ground.slots.forEach(slot => {
      const booking: GroundBooking = {
        by: data.adminID,
        slotTimestamp: slot,
        groundID: ground.id,
      }
      const bookingRef = db.collection('groundBookings').doc();
      batch.create(bookingRef, booking);
    })
  })

  // Not configured for multiple leagues in a season
  // Posting empty league table if season contains league
  if (season.cont_tour.includes('FPL')) {
    const emptyTable = getEmptyLeagueTable(data.seasonID, data.matchType.participatingTeamsCount);
    const tableRef = db.collection('leagues').doc(data.seasonID);
    if (emptyTable) {
      batch.set(tableRef, { ...emptyTable });
    }
  }

  // Not configured for multiple knockout in a season
  // Setting up empty knockout stage matches if season contains knockout tournament
  if (season.cont_tour.includes('FKC')) {
    const knockoutFixtures = fixtures.filter(el => el.type === 'FKC');
    knockoutFixtures.sort(sortObjectByKey('date'));
    const roundsList = getRoundsList(data.matchType.participatingTeamsCount);
    knockoutFixtures.map((fixture, index) => {
      const data: MatchFixture = fixture;
      data.fkcRound = roundsList[index] as KnockoutRounds;
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

  return batch.commit();
}

export function getPublishableFixture(data: IDummyFixture[]) {
  return data.map(val => ({
    id: val.id,
    date: val.date,
    concluded: false,
    home: {
      name: TO_BE_DECIDED,
      logo: DEFAULT_LOGO
    },
    away: {
      name: TO_BE_DECIDED,
      logo: DEFAULT_LOGO
    },
    teams: [TO_BE_DECIDED],
    season: val.season,
    premium: val.premium,
    type: val.type,
    locCity: val.locCity,
    locState: val.locState,
    stadium: val.stadium,
  } as MatchFixture));
}

export function getEmptyLeagueTable(seasonID: string, teamsCount: number): LeagueTableModel[] {
  if (seasonID && teamsCount) {
    const table: LeagueTableModel[] = [];
    for (let i = 0; i < teamsCount; i++) {
      table.push({
        tData: { logo: DEFAULT_LOGO, name: TO_BE_DECIDED },
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

export function getRoundsList(totalTeams: number): number[] {
  const roundsList: number[] = [];
  for (let i = totalTeams; i >= 2; i /= 2) {
    for (let j = i; j > i / 2; j--) {
      roundsList.push(i);
    }
  }
  return roundsList;
}

/* eslint-disable */
import { CloufFunctionFixtureData } from '../../src/app/shared/interfaces/others.model';
import { tempFixtureData } from '../../src/app/shared/interfaces/match.model';
import {
  getParticipants,
  getRotatedTeams,
  getTimeslots,
} from './abstractFunctions';
import { SeasonParticipants } from '../../src/app/shared/interfaces/season.model';
import * as admin from 'firebase-admin';
export async function getFixtures(
  data: CloufFunctionFixtureData,
  context: any
): Promise<any> {
  const fixtures: tempFixtureData[] = [];
  const grTimings: any[] = data.grounds.map((gr) => gr.timings);

  let participants: SeasonParticipants[] = await getParticipants(data.sid);
  if (data.tour_type === 'FPL') {
    participants = getRotatedTeams(participants);
  }
  // main loop for iterating over dates start from season launch date
  for (
    const i = new Date(data.startDate);
    data.matches > 0;
    i.setDate(i.getDate() + 1)
  ) {
    // loop for multiple grounds
    for (let j = 0; j < data.grounds.length; j++) {
      const timeslot = getTimeslots(grTimings[j][i.getDay()], data.oneMatchDur);

      // loop for assigning timeslots hours
      // tslint:disable-next-line: prefer-for-of
      for (let k = 0; k < timeslot.length; k++) {
        if (data.matches <= 0) {
          break;
        }
        data.matches--;
        fixtures.push({
          date: admin.firestore.Timestamp.fromDate(
            new Date(i.getFullYear(), i.getMonth(), i.getDate(), timeslot[k])
          ),
          teams: [participants[0].tname, participants[1].tname],
          logos: [participants[0].tlogo, participants[1].tlogo],
          season: data.sname,
          type: data.tour_type,
          locCity: data.grounds[j].locCity,
          locState: data.grounds[j].locState,
          stadium: data.grounds[j].name,
        });
        participants.splice(0, 2);
      }
    }
  }
  return fixtures;
}

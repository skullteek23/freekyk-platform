import * as admin from 'firebase-admin';
const db = admin.firestore();
import { LeagueTableModel } from '../../src/app/shared/interfaces/others.model';
import { SeasonParticipants } from '../../src/app/shared/interfaces/season.model';
import { getParticipants } from './abstractFunctions';

export async function initLeagueTable(data: any, context: any): Promise<any> {
  try {
    // code here
    const participants: SeasonParticipants[] = await getParticipants(data);
    const table: LeagueTableModel[] = [];
    participants.forEach((participant) => {
      table.push({
        tData: { timgpath: participant.tlogo, tName: participant.tname },
        w: 0,
        d: 0,
        l: 0,
        gf: 0,
        ga: 0,
      });
    });
    return db.collection(`leagues`).doc(data).set({ ...table });
  } catch (error) {
    Promise.reject(error);
  }
}

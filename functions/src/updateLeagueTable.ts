import * as admin from 'firebase-admin';
import { LeagueTableModel } from '../../src/app/shared/interfaces/others.model';
const db = admin.firestore();

export async function updateLeagueTable(data: any, context: any): Promise<any> {
  try {
    // code here
    let leagueTable = JSON.parse(JSON.stringify((await db.collection('leagues').doc(data.sid).get()).data()));

    for (const entry in leagueTable) {
      if ((leagueTable[entry] as LeagueTableModel).tData.tName === data.homeTeam) {
        const statsBefore = leagueTable[entry] as LeagueTableModel;
        const gfor: number = statsBefore + data.score[0];
        const gagainst: number = statsBefore + data.score[1];
        const isDraw = data.score[0] === data.score[1];
        leagueTable[entry] = {
          ...leagueTable[entry],
          w: data.score[0] > data.score[1] ? statsBefore.w++ : statsBefore.w,
          d: isDraw ? statsBefore.d++ : statsBefore.d,
          l: data.score[0] < data.score[1] ? statsBefore.l++ : statsBefore.l,
          gf: gfor,
          ga: gagainst,
        };
      }
      if ((leagueTable[entry] as LeagueTableModel).tData.tName === data.awayTeam) {
        const statsBefore = leagueTable[entry] as LeagueTableModel;
        const gfor: number = statsBefore + data.score[1];
        const gagainst: number = statsBefore + data.score[0];
        const isDraw = data.score[0] === data.score[1];
        leagueTable[entry] = {
          ...leagueTable[entry],
          w: data.score[1] > data.score[0] ? statsBefore.w++ : statsBefore.w,
          d: isDraw ? statsBefore.d++ : statsBefore.d,
          l: data.score[1] < data.score[0] ? statsBefore.l++ : statsBefore.l,
          gf: gfor,
          ga: gagainst,
        };
      }
    }
    return db.collection('leagues').doc(data.sid).update({ ...leagueTable });
  } catch (error) {
    Promise.reject(error);
  }
}

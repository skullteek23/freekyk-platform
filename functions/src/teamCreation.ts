/* eslint-disable */
import * as admin from 'firebase-admin';
import {
  TeamBasicInfo,
  TeamMoreInfo,
  TeamStats,
  Tmember,
  TeamMembers,
} from '../../src/app/shared/interfaces/team.model';
let db = admin.firestore();
export async function teamCreation(
  data: {
    newTeamInfo: {
      id: string;
      name: string;
      imgpath: string;
      logoPath: string;
    };
    tcaptainId: string;
  },
  context: any
) {
  try {
    if (context.auth?.uid != data.tcaptainId) return null;
    let allPromises: any[] = [];

    //get
    const playerSnap = (
      await db.collection('players').doc(data.tcaptainId).get()
    ).data();
    //get

    //create
    const newTeam: TeamBasicInfo = {
      tname: data.newTeamInfo.name,
      isVerified: false,
      imgpath: data.newTeamInfo.imgpath,
      imgpath_logo: data.newTeamInfo.logoPath,
      captainId: data.tcaptainId,
    };
    const teamMoreInfo: TeamMoreInfo = {
      tdateCreated: admin.firestore.Timestamp.fromDate(new Date()),
      tageCat: 30,
      captainName: playerSnap?.name,
    };
    const newStats: TeamStats = {
      played: { fkc: 0, fcp: 0, fpl: 0 },
      w: 0,
      g: 0,
      l: 0,
      rcards: 0,
      ycards: 0,
      g_conceded: 0,
      pr_tour_wins: 0,
    };
    const newMember: Tmember[] = [];
    newMember.push({
      id: data.tcaptainId,
      name: playerSnap?.name,
      pl_pos: playerSnap?.pl_pos ? playerSnap?.pl_pos : 'Unknown Position',
      imgpath_sm: playerSnap?.imgpath_sm
        ? playerSnap?.imgpath_sm
        : 'https://firebasestorage.googleapis.com/v0/b/football-platform-v1.appspot.com/o/dummy_player_sm.jpg?alt=media&token=b4d439a7-f5e8-4cde-8f84-e7751b437763',
    });
    const tMembers: TeamMembers = {
      memCount: newMember.length,
      members: newMember,
    };
    //create

    //update
    allPromises.push(
      db
        .collection('players')
        .doc(data.tcaptainId)
        .update({
          team: {
            name: data.newTeamInfo.name,
            id: data.newTeamInfo.id,
            capId: data.tcaptainId,
          },
        })
    );
    allPromises.push(
      db.collection('teams').doc(data.newTeamInfo.id).set(newTeam)
    );
    allPromises.push(
      db
        .collection('teams/' + data.newTeamInfo.id + '/additionalInfo')
        .doc('moreInfo')
        .set(teamMoreInfo)
    );
    allPromises.push(
      db
        .collection('teams/' + data.newTeamInfo.id + '/additionalInfo')
        .doc('statistics')
        .set(newStats)
    );
    allPromises.push(
      db
        .collection('teams/' + data.newTeamInfo.id + '/additionalInfo')
        .doc('members')
        .set(tMembers)
    );
    // update

    console.log('Team created');
    return await Promise.all(allPromises);
  } catch (error) {
    console.log(error);
    return error;
  }
}

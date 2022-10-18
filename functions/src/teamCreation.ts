import * as admin from 'firebase-admin';
import { TeamBasicInfo, TeamMoreInfo, Tmember, TeamMembers } from '../../src/app/shared/interfaces/team.model';
import { PlayerBasicInfo } from '../../src/app/shared/interfaces/user.model';

let db = admin.firestore();

export async function teamCreation(data: {
  newTeamInfo: {
    id: string;
    name: string;
    imgpath: string;
    logoPath: string;
  };
  tcaptainId: string;
}, context: any) {

  const DEFAULT_PHOTO = 'https://firebasestorage.googleapis.com/v0/b/freekyk-prod.appspot.com/o/dummy_logo.png?alt=media&token=c787be11-7ed7-4df4-95d0-5ed0dffd3102';
  const DEFAULT_POSITION = 'NA';
  const UID = context && context.auth && context.auth.uid ? context.auth.uid : null;
  const CAPTAIN_ID = data && data.tcaptainId ? data.tcaptainId : null;
  const teamData = data && data.newTeamInfo ? data.newTeamInfo : null;
  let teamInfo: TeamBasicInfo;
  let teamMoreInfo: TeamMoreInfo;
  let allPromises: any[] = [];
  let tMembers: TeamMembers;

  if (UID && CAPTAIN_ID && teamData && UID === CAPTAIN_ID) {
    const captainInfo = (await db.collection('players').doc(CAPTAIN_ID).get()).data() as PlayerBasicInfo;
    const teamInfoPath = `teams/${teamData.id}/additionalInfo`;
    const membersList: Tmember[] = [{
      id: CAPTAIN_ID,
      name: captainInfo.name,
      pl_pos: captainInfo.pl_pos ? captainInfo.pl_pos : DEFAULT_POSITION,
      imgpath_sm: captainInfo.imgpath_sm ? captainInfo.imgpath_sm : DEFAULT_PHOTO,
    }];

    teamInfo = {
      tname: teamData.name,
      isVerified: false,
      imgpath: teamData.imgpath,
      imgpath_logo: teamData.logoPath,
      captainId: CAPTAIN_ID,
    };
    teamMoreInfo = {
      tdateCreated: admin.firestore.Timestamp.now().toMillis(),
      tageCat: 30,
      captainName: captainInfo.name,
    };
    tMembers = {
      memCount: 1,
      members: membersList,
    };

    allPromises.push(db.collection('teams').doc(teamData.id).set(teamInfo));
    allPromises.push(db.collection(teamInfoPath).doc('moreInfo').set(teamMoreInfo));
    allPromises.push(db.collection(teamInfoPath).doc('members').set(tMembers));
    allPromises.push(db.collection('players').doc(CAPTAIN_ID).update({
      team: {
        name: teamData.name,
        id: teamData.id,
        capId: CAPTAIN_ID,
      }
    }));

    return Promise.all(allPromises);
  }
  return false;
}


import * as admin from 'firebase-admin';
import { MatchFixture, MatchReportFormData } from '../../src/app/shared/interfaces/match.model';
import { ListOption } from '../../src/app/shared/interfaces/others.model';
const db = admin.firestore();

export async function matchReportUpdate(data: any, context: any): Promise<any> {
  const fixtureData: MatchFixture = data['fixture'] || null;
  const playersHome: ListOption[] = data['playersListHome'] || null;
  const playersAway: ListOption[] = data['playersListAway'] || null;
  const formData: MatchReportFormData = data['formData'] || null;
  const batch = db.batch();
  const seasonID: string = (await db.collection('seasons').where('name', '==', fixtureData.season).get())?.docs[0]?.id;
  const tid_home: string = (await db.collection('teams').where('tname', '==', fixtureData.home.name).get())?.docs[0]?.id;
  const tid_away: string = (await db.collection('teams').where('tname', '==', fixtureData.away.name).get())?.docs[0]?.id;
  // const LABEL_NOT_AVAILABLE = 'N/A';

  if (!fixtureData || !playersHome || !playersAway || !formData || !seasonID || !batch || !tid_home || !tid_away) {
    return false;
  }

  // Season Stats Update
  const g: number = (formData.awayScore + formData.homeScore);
  const rcards: number = (formData.redCardHoldersHome.length + formData.redCardHoldersAway.length);
  const ycards: number = (formData.yellowCardHoldersHome.length + formData.yellowCardHoldersAway.length);
  // const maxGoal: number = Math.max(...formData.scorersGoals);
  // const highestScorerList: string[] = [];
  // formData.scorersGoals.forEach((value, index) => {
  //   const scorer = formData.scorers[index]?.viewValue || '';
  //   if (value === maxGoal && value > 0 && scorer) {
  //     highestScorerList.push(scorer);
  //   }
  // });
  // const highestScorer = highestScorerList.length ? highestScorerList.join(", ") : LABEL_NOT_AVAILABLE;

  const seasonRef = db.collection(`seasons/${seasonID}/additionalInfo`).doc('statistics');

  if ((await seasonRef.get()).exists) {
    batch.update(seasonRef, {
      g: admin.firestore.FieldValue.increment(g),
      rcards: admin.firestore.FieldValue.increment(rcards),
      ycards: admin.firestore.FieldValue.increment(ycards),
    });
  } else {
    batch.set(seasonRef, { g, rcards, ycards });
  }

  // Team Stats Update
  const fkc_played = fixtureData.type === 'FKC' ? 1 : 0;
  const fcp_played = fixtureData.type === 'FCP' ? 1 : 0;
  const fpl_played = fixtureData.type === 'FPL' ? 1 : 0;
  const g_home = formData.homeScore;
  const g_away = formData.awayScore;
  const rcards_home = formData.redCardHoldersHome.length;
  const rcards_away = formData.redCardHoldersHome.length;
  const ycards_home = formData.yellowCardHoldersHome.length;
  const ycards_away = formData.yellowCardHoldersHome.length;
  let w_home = 0;
  let w_away = 0;
  if (g_home !== g_away) {
    w_home = (g_home > g_away) ? 1 : 0;
    w_away = (g_away > g_home) ? 1 : 0;
  } else {
    w_home = (formData.homePenScore > formData.awayPenScore) ? 1 : 0;
    w_away = (formData.awayPenScore > formData.homePenScore) ? 1 : 0;
  }

  const refTeam_home = db.collection(`teams/${tid_home}/additionalInfo`).doc('statistics');
  const refTeam_away = db.collection(`teams/${tid_away}/additionalInfo`).doc('statistics');

  // Home Team
  if ((await refTeam_home.get()).exists) {
    batch.update(refTeam_home, {
      fkc_played: admin.firestore.FieldValue.increment(fkc_played),
      fcp_played: admin.firestore.FieldValue.increment(fcp_played),
      fpl_played: admin.firestore.FieldValue.increment(fpl_played),
      w: admin.firestore.FieldValue.increment(w_home),
      g: admin.firestore.FieldValue.increment(g_home),
      l: admin.firestore.FieldValue.increment(w_away),
      rcards: admin.firestore.FieldValue.increment(rcards_home),
      ycards: admin.firestore.FieldValue.increment(ycards_home),
      g_conceded: admin.firestore.FieldValue.increment(g_away),
    });
  } else {
    batch.set(refTeam_home, {
      fkc_played,
      fcp_played,
      fpl_played,
      w: w_home,
      g: g_home,
      l: w_away,
      rcards: rcards_home,
      ycards: ycards_home,
      g_conceded: g_away,
    });
  }

  // Away Team
  if ((await refTeam_away.get()).exists) {
    batch.update(refTeam_away, {
      fkc_played: admin.firestore.FieldValue.increment(fkc_played),
      fcp_played: admin.firestore.FieldValue.increment(fcp_played),
      fpl_played: admin.firestore.FieldValue.increment(fpl_played),
      w: admin.firestore.FieldValue.increment(w_away),
      g: admin.firestore.FieldValue.increment(g_away),
      l: admin.firestore.FieldValue.increment(w_home),
      rcards: admin.firestore.FieldValue.increment(rcards_away),
      ycards: admin.firestore.FieldValue.increment(ycards_away),
      g_conceded: admin.firestore.FieldValue.increment(g_home),
    });
  } else {
    batch.set(refTeam_away, {
      fkc_played,
      fcp_played,
      fpl_played,
      w: w_away,
      g: g_away,
      l: w_home,
      rcards: rcards_away,
      ycards: ycards_away,
      g_conceded: g_home,
    });
  }

  // Player Stats Update
  for (let i = 0; i < playersHome.length; i++) {
    const scorerIndex = formData.scorers.findIndex(el => el.viewValue === playersHome[i].viewValue);
    const w_player = w_home;
    const rcards_player = formData.redCardHoldersHome.findIndex(el => el.viewValue === playersHome[i].viewValue) > -1 ? 1 : 0;
    const ycards_player = formData.yellowCardHoldersHome.findIndex(el => el.viewValue === playersHome[i].viewValue) > -1 ? 1 : 0;
    const l_player = w_away;
    let g_player = 0;
    if (scorerIndex > -1) {
      g_player = formData.scorersGoals[scorerIndex];
    }

    const playerRef = db.collection(`players/${playersHome[i].value}/additionalInfo`).doc('statistics');

    if ((await playerRef.get()).exists) {
      batch.update(playerRef, {
        apps: admin.firestore.FieldValue.increment(1),
        g: admin.firestore.FieldValue.increment(g_player),
        w: admin.firestore.FieldValue.increment(w_player),
        rcards: admin.firestore.FieldValue.increment(rcards_player),
        ycards: admin.firestore.FieldValue.increment(ycards_player),
        l: admin.firestore.FieldValue.increment(l_player),
      });
    } else {
      batch.set(playerRef, {
        apps: 1,
        g: g_player,
        w: w_player,
        rcards: rcards_player,
        ycards: ycards_player,
        l: l_player,
      });
    }
  }

  for (let i = 0; i < playersAway.length; i++) {
    const scorerIndex = formData.scorers.findIndex(el => el.viewValue === playersAway[i].viewValue);
    const w_player = w_away;
    const rcards_player = formData.redCardHoldersAway.findIndex(el => el.viewValue === playersAway[i].viewValue) > -1 ? 1 : 0;
    const ycards_player = formData.yellowCardHoldersAway.findIndex(el => el.viewValue === playersAway[i].viewValue) > -1 ? 1 : 0;
    const l_player = w_home;
    let g_player = 0;
    if (scorerIndex > -1) {
      g_player = formData.scorersGoals[scorerIndex];
    }

    const playerRef = db.collection(`players/${playersAway[i].value}/additionalInfo`).doc('statistics');

    if ((await playerRef.get()).exists) {
      batch.update(playerRef, {
        apps: admin.firestore.FieldValue.increment(1),
        g: admin.firestore.FieldValue.increment(g_player),
        w: admin.firestore.FieldValue.increment(w_player),
        rcards: admin.firestore.FieldValue.increment(rcards_player),
        ycards: admin.firestore.FieldValue.increment(ycards_player),
        l: admin.firestore.FieldValue.increment(l_player),
      });
    } else {
      batch.set(playerRef, {
        apps: 1,
        g: g_player,
        w: w_player,
        rcards: rcards_player,
        ycards: ycards_player,
        l: l_player,
      });
    }
  }

  // Match Stats Update
  if (fixtureData && fixtureData.id) {
    const newHomeObj = fixtureData.home;
    const newAwayObj = fixtureData.away;
    newHomeObj['score'] = g_home;
    newAwayObj['score'] = g_away;
    const update: any = {
      concluded: true,
      home: newHomeObj,
      away: newAwayObj
    };
    if (formData.homePenScore && formData.awayPenScore && (formData.homePenScore > 0 || formData.awayPenScore > 0)) {
      update['tie_breaker'] = `Penalities: ${formData.homePenScore}-${formData.awayPenScore}`
    }
    const matchRef = db.collection('allMatches').doc(fixtureData.id);
    batch.update(matchRef, update)
  }

  return batch.commit();
}

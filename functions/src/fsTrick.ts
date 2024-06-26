// import * as admin from 'firebase-admin';
// import { firestore } from 'firebase-admin';
// import { FsTrick } from '@shared/interfaces/others.model';
// import { FsStats } from '@shared/interfaces/user.model';

// const db = admin.firestore();

// export async function fsTrick(
//   data: { trick: FsTrick; videoLink: string; },
//   context: any
// ): Promise<any> {
//   try {
//     // get
//     const playerId = context.auth?.uid ? context.auth.uid : '';

//     const trickSnap = (
//       await db
//         .collection('freestylers/' + playerId + '/additionalInfoFs')
//         .doc('statistics')
//         .get()
//     ).data() as FsStats;
//     if (trickSnap === undefined) {
//       throw new Error(`Doc doesn't exist`);
//     }

//     // get

//     // create
//     const allPromises = [];
//     const newSkillLevel =
//       trickSnap.sk_lvl > data.trick.trickSkillLvl
//         ? trickSnap.sk_lvl
//         : data.trick.trickSkillLvl;
//     // create

//     // update
//     allPromises.push(
//       db
//         .collection('freestylers/' + playerId + '/journeyFs')
//         .doc(data.trick.trickNo.toString())
//         .set({
//           trick_no: data.trick.trickNo,
//           submissionVideo: data.videoLink,
//           trick_status: 'w',
//         })
//     );
//     allPromises.push(
//       db
//         .collection('freestylers/' + playerId + '/additionalInfoFs')
//         .doc('statistics')
//         .update({
//           sk_lvl: newSkillLevel,
//           tr_w: firestore.FieldValue.increment(1),
//         })
//     );

//     // update
//     return Promise.all(allPromises);
//   } catch (error) {
//     return error;
//   }
// }

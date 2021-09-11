import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import { SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';
import firebase from 'firebase/app';
// export function CALCULATE_MIN_DURATION(
//   gData: {}[], // this is/these are ground timing details
//   playhours: number, // this is total duration of the tournament matches
//   playhoursgap: number // this is duration of one match
// ) {
//   console.log(gData[0]);
//   console.log(gData[1]);
//   console.log(gData[2]);
//   console.log(playhours);
//   console.log(playhoursgap);
//   if (gData.length > 3 || !gData) return null;
//   if (playhoursgap > 3 || playhoursgap < 1) return null;
//   let g2Data: {};
//   let g3Data: {};
//   let g1Data: {} = gData[0];
//   if (gData.length == 2) g2Data = gData[1];
//   if (gData.length == 3) {
//     g2Data = gData[1];
//     g3Data = gData[2];
//   }
//   let timeArray1 = [];
//   let timeArray2 = [];
//   let timeArray3 = [];
//   let duration = 0;
//   let isGround1Full = false;
//   let isGround2Full = false;
//   let isGround3Full = false;
//   let a = 0;
//   for (
//     let newDate = new Date();
//     playhours > 0;
//     newDate.setDate(newDate.getDate() + 1)
//   ) {
//     timeArray1 = SET_PLAYHOURS(
//       g1Data[newDate.getDay()].sort(GREATER_THAN).map(Number),
//       playhoursgap
//     );

//     //can be optimised further here, hint: loop can be replaced with simple math operation
//     for (let j = 0; j < timeArray1.length; j++) {
//       if (playhours <= 0) {
//         isGround1Full = true;
//         break;
//       }

//       playhours -= playhoursgap;
//     }
//     //can be optimised further here

//     if (!isGround1Full && gData.length > 1)
//       multipleGrounds: {
//         timeArray2 = SET_PLAYHOURS(
//           g2Data[newDate.getDay()].sort(GREATER_THAN).map(Number),
//           playhoursgap
//         );
//         for (let k = 0; k < timeArray2.length; k++) {
//           if (playhours <= 0) {
//             isGround2Full = true;
//             break multipleGrounds;
//           }

//           playhours -= playhoursgap;
//         }
//         if (!isGround2Full && gData.length == 3) {
//           timeArray3 = SET_PLAYHOURS(
//             g3Data[newDate.getDay()].sort(GREATER_THAN).map(Number),
//             playhoursgap
//           );
//           for (let l = 0; l < timeArray3.length; l++) {
//             if (playhours <= 0) {
//               isGround3Full = true;
//               break multipleGrounds;
//             }
//             playhours -= playhoursgap;
//           }
//         }
//       }
//     duration++;
//   }

//   return duration;
// }
// export function GENERATE_FIXTURES(
//   seasonInfo: SeasonBasicInfo,
//   gData: {}[], // this is/these are ground timing details
//   playhours: number, // this is total duration of the tournament matches
//   playhoursgap: number, // this is duration of one match
//   tounamentType: 'FKC' | 'FCP' | 'FPL'
// ) {
//   // if (!gData) return null;
//   let groundsUsed = 1;
//   if (gData.length == 2) groundsUsed++;
//   if (gData.length == 3) groundsUsed++;
//   let timeSlotsG1 = [];
//   let timeSlotsG2 = [];
//   let timeSlotsG3 = [];
//   let fixtures: MatchFixture[] = [];
//   let duration = 0;
//   let isGround1Full = false;
//   let isGround2Full = false;
//   let isGround3Full = false;

//   for (let i = new Date(seasonInfo.start_date); playhours > 0; i.setDate(i.getDate() + 1)) {
//     timeSlotsG1 = GET_TIMESLOTS(gData[0][i.getDay()].sort(GREATER_THAN).map(Number), playhoursgap);
//     playhours -= timeSlotsG1.length * playhoursgap;
//     // for (let j = 0; j < timeSlotsG1.length; j++) {
//     //   if (playhours <= 0) {
//     //     isGround1Full = true;
//     //     break;
//     //   }
//     //   playhours -= playhoursgap;
//     // }
//   }

//   return fixtures;
// }
// function GREATER_THAN(a, b) {
//   return a - b;
// }

// function GET_TIMESLOTS(arr: number[], gap: number) {
//   //can be optimised further here
//   for (let i = 0; i < arr.length; i++) {
//     let el = arr[i] + gap;
//     if (arr.includes(el)) {
//       let elIndex = arr.findIndex((a) => {
//         if (a == el) return true;
//       });
//       let diff = Math.abs(i - elIndex);
//       if (diff > 1) arr.splice(i + 1, diff - 1);
//     } else {
//       if (arr[i + 1] == arr[i] + 1 && arr[i + 2] == arr[i] + 2)
//       arr.splice(i + 1, 2);
//       else if (arr[i + 1] == arr[i] + 1 || arr[i + 1] == arr[i] + 2)
//         arr.splice(i + 1, 1);
//       }
//     }
//   //can be optimised further here
//   return arr;
// }

// // if (!isGround1Full && groundsUsed > 1)
// //   multipleGrounds: {
// //     timeArray2 = SET_PLAYHOURS(
// //       gData[1][i.getDay()].sort(GREATER_THAN).map(Number),
// //       playhoursgap
// //     );
// //     for (let k = 0; k < timeArray2.length; k++) {
// //       if (playhours <= 0) {
// //         isGround2Full = true;
// //         break multipleGrounds;
// //       }
// //       fixtures.push({
// //         date: firebase.firestore.Timestamp.fromDate(seasonInfo.start_date),
// //         concluded: false,
// //         teams: [],
// //         logos: [],
// //         season: seasonInfo.name,
// //         premium: true,
// //         type: tounamentType,
// //         locCity: seasonInfo.locCity,
// //         locState: seasonInfo.locState,
// //       });

// //       playhours -= playhoursgap;
// //     }
// //     if (!isGround2Full && groundsUsed == 3) {
// //       timeArray3 = SET_PLAYHOURS(
// //         gData[2][i.getDay()].sort(GREATER_THAN).map(Number),
// //         playhoursgap
// //       );
// //       for (let l = 0; l < timeArray3.length; l++) {
// //         if (playhours <= 0) {
// //           isGround3Full = true;
// //           break multipleGrounds;
// //         }
// //         fixtures.push({
// //           date: firebase.firestore.Timestamp.fromDate(
// //             seasonInfo.start_date
// //           ),
// //           concluded: false,
// //           teams: [],
// //           logos: [],
// //           season: seasonInfo.name,
// //           premium: true,
// //           type: tounamentType,
// //           locCity: seasonInfo.locCity,
// //           locState: seasonInfo.locState,
// //         });
// //         playhours -= playhoursgap;
// //       }
// //     }
// //   }

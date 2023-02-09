// import * as admin from 'firebase-admin';
// import { Invite, NotificationBasic } from '@shared/interfaces/notification.model';
// import { Tmember } from '@shared/interfaces/team.model';
// import { PlayerBasicInfo } from '@shared/interfaces/user.model';

// const db = admin.firestore();

// export async function inviteUpdationTrigger(change: any, context: any): Promise<any> {

//   const update = change.after.data() as Invite;
//   const updateID = change.after.id || '';
//   if (!update || !updateID) {
//     return false;
//   }
//   switch (update.status) {
//     case 'wait':
//       const notification: NotificationBasic = {
//         type: 'captain request',
//         senderId: update.teamId,
//         receiverId: update.inviteeId,
//         date: admin.firestore.Timestamp.now().toMillis(),
//         title: 'Team Join Invite',
//         read: false,
//         senderName: update.teamName,
//       };
//       return db.collection(`players/${notification}/Notifications`).doc(updateID).set(notification);

//     case 'reject':
//       return db.collection(`players/${update.inviteeId}/Notifications`).doc(updateID).delete();

//     case 'accept':
//       return joinTeam(update, change.after.id);

//     default:
//       return true;
//   }
// }




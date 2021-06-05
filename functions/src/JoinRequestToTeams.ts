import * as admin from 'firebase-admin';
let db = admin.firestore();
import { NotificationBasic } from '../../src/app/shared/interfaces/notification.model';

export async function joinRequests(
  data: { capId: string[]; name: string },
  context: any
) {
  try {
    //get
    var batch = db.batch();
    //get

    //create
    console.log(data.capId);
    console.log(data.name);
    console.log(context.auth?.uid);
    data.capId.forEach((captainId) => {
      const newNotif: NotificationBasic = {
        type: 'request',
        senderId: context.auth?.uid == undefined ? '' : context.auth?.uid,
        recieverId: captainId,
        date: admin.firestore.Timestamp.fromDate(new Date()),
        title: 'Join Request',
        senderName: data.name,
      };
      let notifRef = db
        .collection('players/' + captainId + '/Notifications')
        .doc();
      batch.set(notifRef, newNotif);
    });
    //create

    //update
    return batch.commit();
    //update
  } catch (error) {
    console.log(error);
    return error;
  }
}

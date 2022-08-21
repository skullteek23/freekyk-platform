import { Invite } from '../../../src/app/shared/interfaces/notification.model';
import * as admin from 'firebase-admin';
const db = admin.firestore();

export async function inviteDeletionTrigger(snap: any, context: any): Promise<any> {

  const invite: Invite = snap.data() as Invite;
  const inviteID = snap && snap['id'] ? snap['id'] : '';
  if (invite && inviteID) {
    return db.collection(`players/${invite.inviteeId}/Notifications`).doc(inviteID).delete();
  }
  return false;
}

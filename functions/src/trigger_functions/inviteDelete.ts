import { Invite } from '../../../src/app/shared/interfaces/notification.model';
import { DeleteNotifById } from '../abstractFunctions';

export async function inviteDeletionTrigger(
  snap: any,
  context: any
): Promise<any> {
  try {
    const inviteId: string = snap.id;
    const delInvite: Invite = snap.data();
    DeleteNotifById(inviteId, delInvite.inviteeId);
  } catch (error) {
    return error;
  }
}

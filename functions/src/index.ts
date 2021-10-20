import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();
import { getFixtures } from './fixtures';
import { fsTrick } from './fsTrick';
import { joinRequests } from './JoinRequestToTeams';
import { newProfile } from './newProfile';
import { teamCreation } from './teamCreation';
import { teamDeleter } from './deleteTeam';
import { paymentVerification } from './paymentVerification';
import { inviteCreationTrigger } from './trigger_functions/createInvite';
import { inviteDeletionTrigger } from './trigger_functions/inviteDelete';
import { inviteUpdationTrigger } from './trigger_functions/updateInvite';
import { generateOrder } from './generateOrder';

// callable functions
export const createProfile = functions.https.onCall(newProfile);
export const submitFsTrick = functions.https.onCall(fsTrick);
export const sendJoinRequest = functions.https.onCall(joinRequests);
export const createTeam = functions.https.onCall(teamCreation);
export const generateFixtures = functions.https.onCall(getFixtures);
export const deleteTeam = functions.https.onCall(teamDeleter);
export const generateRazorpayOrder = functions.https.onCall(generateOrder);
export const verifyPayment = functions.https.onCall(paymentVerification);
// callable functions

// trigger functions
export const onCreateInvite = functions.firestore
  .document('invites/{inviteId}')
  .onCreate(inviteCreationTrigger);
export const onUpdateInvite = functions.firestore
  .document('invites/{inviteId}')
  .onUpdate(inviteUpdationTrigger);
export const onDeleteInvite = functions.firestore
  .document('invites/{inviteId}')
  .onDelete(inviteDeletionTrigger);
// trigger functions

/* eslint-disable */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();
import { getFixtures } from './fixtures';
import { fsTrick } from './fsTrick';
import { joinRequests } from './JoinRequestToTeams';
import { newProfile } from './newProfile';
import { teamCreation } from './teamCreation';
import {
  inviteCreationTrigger,
  inviteDeletionTrigger,
  inviteUpdationTrigger,
} from './triggerFunctions';
import { teamDeleter } from './deleteTeam';

//callable functions
export const createProfile = functions.https.onCall(newProfile);
export const submitFsTrick = functions.https.onCall(fsTrick);
export const sendJoinRequest = functions.https.onCall(joinRequests);
export const createTeam = functions.https.onCall(teamCreation);
export const generateFixtures = functions.https.onCall(getFixtures);
export const deleteTeam = functions.https.onCall(teamDeleter);
//callable functions

//trigger functions
export const onCreateInvite = functions.firestore
  .document('invites/{inviteId}')
  .onCreate(inviteCreationTrigger);
export const onUpdateInvite = functions.firestore
  .document('invites/{inviteId}')
  .onUpdate(inviteUpdationTrigger);
export const onDeleteInvite = functions.firestore
  .document('invites/{inviteId}')
  .onDelete(inviteDeletionTrigger);
//trigger functions

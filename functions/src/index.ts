import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();
import { joinRequests } from './JoinRequestToTeams';
import { newProfile } from './newProfile';
import { teamCreation } from './teamCreation';
import { onDelete } from './deleteTeam';
import { paymentVerification } from './paymentVerification';
import { inviteCreationTrigger } from './trigger_functions/createInvite';
import { inviteDeletionTrigger } from './trigger_functions/inviteDelete';
import { inviteUpdationTrigger } from './trigger_functions/updateInvite';
import { generateOrder } from './generateOrder';
import { generateThumbnail } from './trigger_functions/generateThumbnail';
import { environment } from '../../environments/environment';
import { matchReportUpdate } from './matchReportUpdate';
import { seasonPublish } from './publishSeason';
import { createAdminUser } from './createAdminUser';
import { seasonParticipation } from './seasonParticipation';


// callable functions
export const createProfile = functions.region('asia-south1').https.onCall(newProfile);
// export const submitFsTrick = functions.https.onCall(fsTrick);
export const sendJoinRequest = functions.region('asia-south1').https.onCall(joinRequests);
export const createTeam = functions.region('asia-south1').https.onCall(teamCreation);
export const deleteTeam = functions.region('asia-south1').https.onCall(onDelete);
export const generateRazorpayOrder = functions.region('asia-south1').https.onCall(generateOrder);
export const verifyPayment = functions.region('asia-south1').https.onCall(paymentVerification);
export const participateSeason = functions.region('asia-south1').https.onCall(seasonParticipation);
export const updateMatchReport = functions.region('asia-south1').https.onCall(matchReportUpdate);
export const publishSeason = functions.region('asia-south1').https.onCall(seasonPublish);
export const addAdminUser = functions.region('asia-south1').https.onCall(createAdminUser);
// callable functions

// trigger functions
export const onCreateInvite = functions.region('asia-south1').firestore.document('invites/{inviteId}').onCreate(inviteCreationTrigger);
export const onUpdateInvite = functions.region('asia-south1').firestore.document('invites/{inviteId}').onUpdate(inviteUpdationTrigger);
export const onDeleteInvite = functions.region('asia-south1').firestore.document('invites/{inviteId}').onDelete(inviteDeletionTrigger);
export const onUploadProfilePhoto = functions.region('asia-south1').storage.bucket(environment.firebase.storageBucket).object().onFinalize(generateThumbnail);
// export const generateTicketMail = functions.region('asia-south1').storage.bucket(environment.firebase.storageBucket).object().onFinalize();
// export const onDeleteProfilePhoto = functions.region('asia-south1').storage.bucket(environment.firebase.storageBucket).object().onDelete(removeThumbnail);
// trigger functions

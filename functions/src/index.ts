import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();
import { joinRequests } from './JoinRequestToTeams';
import { newProfile } from './newProfile';
import { teamCreation } from './teamCreation';
import { onDelete } from './deleteTeam';
import { paymentVerification } from './paymentVerification';
import { fetchOrder } from './getOrder';
import { generateOrder } from './generateOrder';
import { matchReportUpdate } from './matchReportUpdate';
import { seasonPublish } from './publishSeason';
import { createAdminUser } from './createAdminUser';
import { seasonParticipation } from './seasonParticipation';
import { seasonCancellation } from './seasonCancellation';
import { teamJoin } from './joinTeam';
import { saveRazorpayOrder } from './saveOrder';
import { initRefundOrder } from './refundOrder';


// callable functions
export const createProfile = functions.region('asia-south1').https.onCall(newProfile);
// export const submitFsTrick = functions.https.onCall(fsTrick);
export const sendJoinRequest = functions.region('asia-south1').https.onCall(joinRequests);
export const createTeam = functions.region('asia-south1').https.onCall(teamCreation);
export const joinTeam = functions.region('asia-south1').https.onCall(teamJoin);
export const deleteTeam = functions.region('asia-south1').https.onCall(onDelete);
export const getValidOrder = functions.region('asia-south1').https.onCall(fetchOrder);
export const getNewOrder = functions.region('asia-south1').https.onCall(generateOrder);
export const refundOrder = functions.region('asia-south1').https.onCall(initRefundOrder);
export const verifyPayment = functions.region('asia-south1').https.onCall(paymentVerification);
export const saveOrder = functions.region('asia-south1').https.onCall(saveRazorpayOrder);
export const participateSeason = functions.region('asia-south1').https.onCall(seasonParticipation);
export const updateMatchReport = functions.region('asia-south1').https.onCall(matchReportUpdate);
export const publishSeason = functions.region('asia-south1').https.onCall(seasonPublish);
export const addAdminUser = functions.region('asia-south1').https.onCall(createAdminUser);
export const cancelSeason = functions.region('asia-south1').https.onCall(seasonCancellation);
// callable functions

// trigger functions
// export const onUpdateMatch = functions.region('asia-south1').firestore.document('allMatches/{matchId}').onUpdate(matchUpdateTrigger);
// export const onUploadProfilePhoto = functions.region('asia-south1').storage.bucket(environment.firebase.storageBucket).object().onFinalize(generateThumbnail);
// export const generateTicketMail = functions.region('asia-south1').storage.bucket(environment.firebase.storageBucket).object().onFinalize();
// trigger functions

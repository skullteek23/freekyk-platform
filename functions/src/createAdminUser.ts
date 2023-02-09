import { Admin } from '@shared/interfaces/admin.model';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
// import { environment } from '../../environments/environment';
import { getRandomString, UNIQUE_ORGANIZER_CODE } from './utils/utilities';

const db = admin.firestore();
const auth = admin.auth();
// const mailChimp = require('@mailchimp/mailchimp_transactional')(environment.mailchimp.apiKey);

export async function createAdminUser(data: Admin, context: any) {
  if (!data) {
    throw new functions.https.HttpsError('invalid-argument', 'Error Occurred! Please try again later');
  } else if (await isDuplicateEmail(data.email)) {
    throw new functions.https.HttpsError('already-exists', 'Email already registered. Please use another email!');
  } else {
    const tempID = getRandomString(7);
    const uid = getOrganizerID(tempID);
    const displayName = data.name;
    const email = data.email;
    const password = getRandomString(8);
    console.log('organizerID', uid);
    console.log('email', email);
    console.log('password', password);
    // const emailWrapper = {
    //   from_email: "admin@freekyk.com",
    //   subject: "Account Credentials | Freekyk Admin",
    //   text: `Hi ${displayName},<br><br>

    //   Please find below your account login credentials:<br>
    //   Organizer ID: ${uid}<br>
    //   Email: ${email}<br>
    //   Password: ${password}<br><br>

    //   Follow this link to login to Freekyk admin console:<br>
    //   Link: ${environment.firebase.adminUrl}<br><br>

    //   If you didn't ask to verify this address, you can ignore this email.<br><br>

    //   Thanks & Regards,<br>
    //   Team Freekyk`,
    //   to: [
    //     {
    //       email: email,
    //       type: "to"
    //     }
    //   ]
    // };

    const allPromises: any[] = [];
    allPromises.push(auth.createUser({ email, uid, password, displayName }));
    allPromises.push(db.collection('admins').doc(uid).set(data));
    // allPromises.push(mailChimp.messages.send({ emailWrapper }).toPromise());

    return Promise.all(allPromises);
  }
}


export function getOrganizerID(uid: string): string {
  return `${UNIQUE_ORGANIZER_CODE}-${uid.toUpperCase().slice(0, 6)}`;
}

export async function isDuplicateEmail(email: string): Promise<boolean> {
  return (await db.collection('admins').where('email', '==', email).get()).empty === false;
}

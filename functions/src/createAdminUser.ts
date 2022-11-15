import { Admin } from '@shared/interfaces/admin.model';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { UNIQUE_ORGANIZER_CODE } from './utils/utilities';

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
    console.log(uid);
    console.log(password);
    // const emailWrapper = {
    //   from_email: "freekyk123@gmail.com",
    //   subject: "Email Verification | Freekyk Admin",
    //   text: `Hello ${displayName},

    //   Please find below your account login credentials:
    //   Organizer ID: ${uid}
    //   Email: ${email}
    //   Password: ${password}

    //   Follow this link to login to Freekyk admin console.
    //   ${environment.firebase.adminUrl}/login

    //   If you didn't ask to verify this address, you can ignore this email.

    //   Thanks & Regards,
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
    // mailChimp.messages.send({ emailWrapper });

    return Promise.all(allPromises);
  }
}


export function getOrganizerID(uid: string): string {
  return `${UNIQUE_ORGANIZER_CODE}-${uid.toUpperCase().slice(0, 6)}`;
}


export function getRandomString(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export async function isDuplicateEmail(email: string): Promise<boolean> {
  return (await db.collection('admins').where('email', '==', email).get()).empty === false;
}

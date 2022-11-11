import { Admin } from '@shared/interfaces/admin.model';
import { environment } from '../../../environments/environment';

const mailChimp = require('@mailchimp/mailchimp_transactional')(environment.mailchimp.apiKey);

export async function accountVerificationEmail(snap: any, context: any): Promise<any> {

  const accountData = snap.data() as Admin;

  // Organizer ID
  const organizerID = snap.id;
  const organizerName = accountData.name;
  const organizerEmail = accountData.email;
  const passKey = accountData?.passKey;

  if (accountData && organizerID && passKey) {
    // send email here
    const email = {
      from_email: "freekyk123@gmail.com",
      subject: "Email Verification | Freekyk Admin",
      text: `Hello ${organizerName},

      Please find below your account login credentials:
      Organizer ID: ${organizerID}
      Email: ${organizerEmail}
      Password: ${passKey}

      Follow this link to login to Freekyk admin console.
      ${environment.firebase.adminUrl}/login

      If you didn't ask to verify this address, you can ignore this email.

      Thanks & Regards,
      Team Freekyk`,
      to: [
        {
          email: organizerEmail,
          type: "to"
        }
      ]
    };
    console.log(email)
    return mailChimp.messages.send({ email });
  }

  return false;
}

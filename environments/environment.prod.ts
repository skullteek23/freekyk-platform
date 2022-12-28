export const environment = {
  production: true,
  firebase: {
    apiKey: 'AIzaSyBibLl1ZM0B2Wf4gqofKnUNYuAJCoSBQ-c',
    authDomain: 'freekyk-prod.firebaseapp.com',
    databaseURL:
      'https://freekyk-prod-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'freekyk-prod',
    storageBucket: 'freekyk-prod.appspot.com',
    messagingSenderId: '678320827100',
    appId: '1:678320827100:web:d14c29c405b86b825a2219',
    measurementId: 'G-K55NRR7QXM',
    url: 'https://www.freekyk.com',
    adminUrl: 'https://admin.freekyk.com',
    adminRegister: 'https://admin.freekyk.com/register',
    logoURL: 'https://drive.google.com/file/d/1fUmNtk2jfs_TLtMkpYMMXDwzAKPZME8Q/view?usp=sharing'
  },
  razorPay: {
    key_id: 'rzp_live_ow8sSR7ZCWKSST',
    key_secret: 'ObgEc8yFbtkmCkrexJcedhju',
  },
  // https://www.universal-tutorial.com/api/getaccesstoken
  location: {
    token: 'rBvTqnFug52VojoavuiXTidP55cANzztlxJhNMYn0BMCUxVKD7EjWR_L7JQyY4xh7oo',
    email: 'pgoel681@gmail.com'
  },
  // https://us8.admin.mailchimp.com/account/api/
  mailchimp: {
    apiKey: 'md-keAl01z71HvL5F5q1meOWA',
    transactionalAPIKey: 'd58079aa2ee39de14d79cfc6ed10a880-us21'
  },
  forms: {
    partner: 'https://forms.gle/2jA3qxTJgRkUuKREA'
  },
  socialShare: {
    include: ['facebook', 'twitter', 'google'],
    exclude: ['tumblr', 'stumble', 'vk'],
    theme: 'modern-light',
    gaTracking: true,
    twitterAccount: 'twitterUsername',
    autoSetMeta: true,
  }
};

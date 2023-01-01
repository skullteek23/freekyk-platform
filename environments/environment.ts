export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyAD66YeExDHoZQAWKBGf87BkykUklsLlCI',
    authDomain: 'freekyk-development.firebaseapp.com',
    databaseURL:
      'https://freekyk-development-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'freekyk-development',
    storageBucket: 'freekyk-development.appspot.com',
    messagingSenderId: '954435558889',
    appId: '1:954435558889:web:a8b04b7d21456b5a07bf78',
    url: 'https://dev.freekyk.com',
    adminUrl: 'https://dev.admin.freekyk.com',
    adminRegister: 'https://dev.admin.freekyk.com/register',
    logoURL: 'http://commondatastorage.googleapis.com/codeskulptor-assets/lathrop/asteroid_brown.png'
  },
  // Razorpay
  razorPay: {
    key_id: 'rzp_test_mQuopCCsNb542F',
    key_secret: 'r7Y2JQ4n3VJkTquSn9lO6yHw',
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
  },
  whatsAppCommunity: {
    link: 'https://chat.whatsapp.com/HowuJlzE4qo0CpyoXyevJr'
  }
};

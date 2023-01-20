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
    logoURL: 'https://firebasestorage.googleapis.com/v0/b/freekyk-prod.appspot.com/o/Logo%20Mark%20Color.png?alt=media&token=ab98b246-821a-42fc-8845-ea82634e77af'
  },
  razorPay: {
    key_id: 'rzp_live_jr3zxDVvn9KtS5',
    key_secret: 'QKAVGs5rvgekTz4JDQMhDo63',
  },
  // https://www.universal-tutorial.com/api/getaccesstoken
  location: {
    token: 'jrkrjsDH1j-bT6R5go0k6Ha7qB9CSerPfUxj_Z-PiSMR39B0EmzzzYGBQmKo7yxqrsE',
    email: 'freekyk123@gmail.com'
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

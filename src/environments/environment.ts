// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyAzXC-p7kWnDxku9SR_6okiIn7Ri6Tv67w',
    authDomain: 'football-platform-beta.firebaseapp.com',
    projectId: 'football-platform-beta',
    storageBucket: 'football-platform-beta.appspot.com',
    messagingSenderId: '1098285494743',
    appId: '1:1098285494743:web:22561dab1063e23f2b5b92',
    measurementId: 'G-BDJ5TQ82BE',
  },
  // test api keys
  razorPay: {
    key_id: 'rzp_test_LSdBGlAyude8YE',
    key_secret: 'yN2TYg2VWzuzozdGWRmrX0Ma',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

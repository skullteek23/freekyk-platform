// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    databaseURL:
      'https://football-platform-v1-default-rtdb.asia-southeast1.firebasedatabase.app',
    apiKey: 'AIzaSyBk-AFz7HhA0Htt9WICkVPYWYG4v3jbnmM',
    authDomain: 'football-platform-v1.firebaseapp.com',
    projectId: 'football-platform-v1',
    storageBucket: 'football-platform-images-bucket',
    messagingSenderId: '581569985509',
    appId: '1:581569985509:web:fea62348969bd618dc8d0c',
    measurementId: 'G-DVFLJVY2LP',
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

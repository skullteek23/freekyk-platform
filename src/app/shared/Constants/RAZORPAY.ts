import { InjectionToken } from '@angular/core';
import { environment } from 'src/environments/environment';

export const RazorPayAPI = new InjectionToken<any>('razorPay');
export const CREATE_ORDER_API = 'https://api.razorpay.com/v1/orders';
export const UNIVERSAL_OPTIONS = {
  key: environment.razorPay.key_id,
  currency: 'INR',
  name: 'FREEKYK INDIA',
  description: 'Tournament Entry Fees',
  image:
    'https://firebasestorage.googleapis.com/v0/b/football-platform-v1.appspot.com/o/Logo_JPG%20(1).jpg?alt=media&token=1102514a-5518-4091-bcc7-574e4a468722',
  theme: {
    color: '#00810f',
  },
  // retry: {
  //   max_count: 3,
  // },
  // confirm_close: true,
};
export const UNIVERSAL_TOURNAMENT_FEES = 8000;

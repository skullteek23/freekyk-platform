import { InjectionToken } from '@angular/core';
import { environment } from 'environments/environment';

/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
export const RazorPayAPI = new InjectionToken<any>('razorPay');
export const UNIVERSAL_OPTIONS = {
  key: environment.razorPay.key_id,
  currency: 'INR',
  name: 'Freekyk India',
  image:
    'https://firebasestorage.googleapis.com/v0/b/football-platform-v1.appspot.com/o/logo.png?alt=media&token=f81c67d1-fb00-4500-a286-faa94d1bf9a5',
  theme: {
    color: '#00810f',
  },
  retry: {
    max_count: 3,
  },
  confirm_close: true,
};

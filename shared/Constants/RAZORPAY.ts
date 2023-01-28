import { InjectionToken } from '@angular/core';
import { environment } from 'environments/environment';

export const RazorPayAPI = new InjectionToken<any>('razorPay');
export const UNIVERSAL_OPTIONS = {
  key: environment.razorPay.key_id,
  currency: 'INR',
  name: 'Freekyk India',
  image: environment.firebase.logoURL,
  theme: {
    color: '#00810f',
  },
  retry: {
    max_count: 3,
  },
  confirm_close: true,
};

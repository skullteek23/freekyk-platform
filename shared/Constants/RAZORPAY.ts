import { InjectionToken } from '@angular/core';
import { ICheckoutOptions } from '@shared/interfaces/order.model';
import { environment } from 'environments/environment';

export const RazorPayAPI = new InjectionToken<any>('razorPay');
export const UNIVERSAL_OPTIONS: Partial<ICheckoutOptions> = {
  key: environment.razorPay.key_id,
  currency: 'INR',
  name: 'Freekyk India',
  image: environment.firebase.logoURL,
  theme: {
    color: '#00810f',
  },
  retry: {
    enabled: true,
  },
  send_sms_hash: true,
  allow_rotation: true,
  timeout: 420,
  remember_customer: true
};

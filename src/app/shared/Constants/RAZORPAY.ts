import { InjectionToken } from '@angular/core';

export const RazorPayAPI = new InjectionToken<any>('razorPay');
export const CREATE_ORDER_API = 'https://api.razorpay.com/v1/orders';
export const OPTIONS = {};
export const TOURNAMENT_FEES = '2000';

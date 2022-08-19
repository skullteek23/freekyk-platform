import { environment } from './environments/environment';

const Razorpay = require('razorpay');

export async function generateOrder(data: any, context: any): Promise<any> {

  const instanceOptions = {
    key_id: environment.razorPay.key_id,
    key_secret: environment.razorPay.key_secret,
  }
  const instance = new Razorpay(instanceOptions);
  const options = {
    amount: (data.amount * 100).toString(), // amount in paise
    currency: 'INR',
  };

  if (instance) {
    return instance.orders.create(options);
  }
  return false;
}

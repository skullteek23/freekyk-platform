import { environment } from '../../environments/environment';

const Razorpay = require('razorpay');

export async function generateOrder(data: any, context: any): Promise<any> {
  const options: any = {
    currency: 'INR',
  };
  if (data.hasOwnProperty('amount')) {
    options['amount'] = Number(data.amount) * 100; // amount in paise
  }
  if (data.hasOwnProperty('amountPartial')) {
    options['partial_payment'] = true;
    options['first_payment_min_amount'] = Number(data.amountPartial) * 100; // amount in paise
  }
  if (data.hasOwnProperty('uid')) {
    options['receipt'] = data.uid;
  }

  const instanceOptions = {
    key_id: environment.razorPay.key_id,
    key_secret: environment.razorPay.key_secret,
  }
  try {
    const instance = new Razorpay(instanceOptions);

    if (instance) {
      return instance.orders.create(options);
    }
    return true;
  } catch (error) {
    return true;
  }

}

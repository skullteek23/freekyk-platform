import {
  RAZORPAY_API_KEYˍID_TEST,
  RAZORPAY_API_KEYˍSECRET_TEST,
} from './constants';
const Razorpay = require('razorpay');
export async function generateOrder(data: any, context: any): Promise<any> {
  const instance = new Razorpay({
    key_id: RAZORPAY_API_KEYˍID_TEST,
    key_secret: RAZORPAY_API_KEYˍSECRET_TEST,
  });
  const options = {
    amount: (data.amount * 100).toString(), // amount in paise
    currency: 'INR',
  };
  return instance.orders.create(options);
}

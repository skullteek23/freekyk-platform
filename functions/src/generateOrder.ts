import {
  RAZORPAY_API_KEYˍID_LIVE,
  RAZORPAY_API_KEYˍSECRET_LIVE,
} from './constants';
const Razorpay = require('razorpay');
export async function generateOrder(data: any, context: any): Promise<any> {
  const instance = new Razorpay({
    key_id: RAZORPAY_API_KEYˍID_LIVE,
    key_secret: RAZORPAY_API_KEYˍSECRET_LIVE,
  });
  const options = {
    amount: (data.amount * 100).toString(), // amount in paise
    currency: 'INR',
  };
  return instance.orders.create(options);
}

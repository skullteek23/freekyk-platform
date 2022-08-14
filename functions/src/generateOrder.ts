import { environment } from "../../src/environments/environment.dev";
// import { environment } from "../../src/environments/environment.prod";

const Razorpay = require('razorpay');
export async function generateOrder(data: any, context: any): Promise<any> {
  const instance = new Razorpay({
    key_id: environment.firebase.storageBucket,
    key_secret: environment.firebase.storageBucket,
  });
  const options = {
    amount: (data.amount * 100).toString(), // amount in paise
    currency: 'INR',
  };
  return instance.orders.create(options);
}

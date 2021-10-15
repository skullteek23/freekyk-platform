const Razorpay = require('razorpay');
export async function createOrder(
  data: { options: any; useLive: boolean },
  context: any
): Promise<any> {
  const LIVE_API_KEY = {
    key_id: 'rzp_live_8BB9gOfLpWDtAG',
    key_secret: 'padz8nMQYYaD7XRZLAY7uZ2Y',
  };
  const TEST_API_KEY = {
    key_id: 'rzp_test_LSdBGlAyude8YE',
    key_secret: 'yN2TYg2VWzuzozdGWRmrX0Ma',
  };
  let instance;
  if (data.useLive === true) {
    instance = new Razorpay(LIVE_API_KEY);
  } else {
    instance = new Razorpay(TEST_API_KEY);
  }
  return await instance.orders.create(data.options);
}

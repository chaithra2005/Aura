const functions = require("firebase-functions");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: "rzp_live_hyjT9nUfMniPJh", // Updated to live Key ID
  key_secret: "rwzk5HWAD4tikNil9yc57VZM"   // Updated to live Key Secret
});

exports.createOrder = functions.https.onRequest(async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount,
    currency: "INR",
    receipt: "receipt_order_" + Date.now(),
    payment_capture: 1
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).send(err);
  }
});

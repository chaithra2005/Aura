const functions = require("firebase-functions");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: "rzp_test_9gpLmkr3hSpOrL", // Replace with your test Key ID
  key_secret: "UsRgQifyZbFTcqXOUD8sK5Q1"   // Replace with your test Key Secret
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

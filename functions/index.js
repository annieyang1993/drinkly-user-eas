'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const { Logging } = require('@google-cloud/logging');
const logging = new Logging({
  projectId: process.env.GCLOUD_PROJECT,
});
const stripe = require("stripe")(functions.config().stripe.secret);

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send({"data": "Hello from Firebase!"});
});


exports.createSetupIntent = functions.https.onRequest(async (request, response) => {
    const data = await stripe.setupIntents.create({
        customer: request.body.customer_id
    });
    response.send(data);
    //response.send(data)
})

exports.createCharge = functions.https.onRequest(async (request, response) => {
  const data = await stripe.paymentIntents.create({
    amount: request.body.amount*100,
    customer: request.body.customer_id,
    payment_method: request.body.payment_id,
    currency: 'CAD',
    confirm: true
  });
  response.send(data);
})


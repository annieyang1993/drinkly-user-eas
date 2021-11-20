import firebase from "firebase/app";
import 'firebase/auth';
import "firebase/firestore";

import { getFunctions } from 'firebase/functions';
//import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: "AIzaSyB06ZEMN3oEUKUoULjT0voktrlQYmPywB0", //Constants.manifest.extra.apiKey,
  authDomain: "drinkly-user.firebaseapp.com", //Constants.manifest.extra.authDomain,
  projectId: "drinkly-user",//Constants.manifest.extra.projectId,
  storageBucket: "drinkly-user.appspot.com",//Constants.manifest.extra.storageBucket,
  messagingSenderId:"489429552606", //Constants.manifest.extra.messagingSenderId,
  appId: "1:489429552606:web:afcf2549f55721a6a1614f"//Constants.manifest.extra.appId
};


let Firebase;
let db;
let functions;


if (firebase.apps.length === 0) {
  Firebase = firebase.initializeApp(firebaseConfig);
  functions = firebase.functions(Firebase);
} else{
  firebase.app()
}
  

//}

export {Firebase, db, functions}


//exports.createStripeCheckout = functions.https.onCall(async (data, context)=>{
//   const stripe = require("stripe")(functions.config().stripe.secret_key);
//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ["card"],
//     mode: "payment",
//     line_items: [
//       {
//         quantity: 1,
//         price_data: {
//           currency: "usd",
//           unit_amount: (5)*100,
//           product_data: {
//             name: "New Camera",
//           },
//         },
//       },
//     ],
//   });

//   return {
//     id: session.id,
//   };
// });

Drinkly Mobile Platform

Drinkly is a 3-app platform where users can find local cafes, order items, track their rewards and earn discount codes. 
Cafes can manage and fulfill orders, view daily order summaries, manage their store details (i.e. store hours, description, location), and update/create menu items. 

To request a demo on iOS TestFlight, please email annieqiyang@gmail.com.


Link to Order Management Repo: https://github.com/annieyang1993/drinkly-order-management

Link to Store Management Repo: https://github.com/annieyang1993/drinkly-store-management-updated

Features

1. Secure user authentication using Firebase Authentication.
2. Users are able to find local cafes and see walking distance to the cafe.
3. Users are able to save their favorite cafes.
4. Users are able to order items, select preferences/add-ons, and set a pick-up time based on the store's operating hours.
5. Users are able to save test credit cards and add cash to their Drinkly Cash balance via the Stripe API.
6. Users are able to track rewards and accumulate discount codes which can be applied upon checkout. 

<img width="309" alt="6" src="https://user-images.githubusercontent.com/82074442/157363926-597461b6-bebe-4227-85fa-76e6b1a782a5.png">


1. Browse local cafes
<img width="309" alt="5" src="https://user-images.githubusercontent.com/82074442/157363996-18d31cd7-afde-46f7-a1e8-f3a86b8e77da.png">

2. Track rewards and earn discounts
<img width="309" alt="1" src="https://user-images.githubusercontent.com/82074442/157364093-cbe229b4-07f6-4563-aa7d-4f6b668f8a6b.png">

3. View Menus
<img width="309" alt="4" src="https://user-images.githubusercontent.com/82074442/157364156-cd7b8fef-bcea-40cb-b4aa-aa2b3356b0a7.png">

4. Order Ahead, Set Pickup Time, and Enter Payment Method
<img width="338" alt="Screen Shot 2022-03-08 at 10 01 52 PM" src="https://user-images.githubusercontent.com/82074442/157364710-267a3129-314e-4f04-8fdb-f3290d9ed971.png">
<img width="309" alt="3" src="https://user-images.githubusercontent.com/82074442/157364224-9a74cef1-7478-4fc4-a8bb-34aa70297199.png">

5. Track Current and Previous Orders
<img width="337" alt="Screen Shot 2022-03-08 at 10 02 14 PM" src="https://user-images.githubusercontent.com/82074442/157364740-d4eea9dd-aea2-4f7a-8fbf-444ae6bc3072.png">
<img width="344" alt="Screen Shot 2022-03-08 at 10 02 07 PM" src="https://user-images.githubusercontent.com/82074442/157364759-d98b07b6-ff5d-49f4-ad20-a95bc3538cd1.png">


6. Use Discount Codes Upon Checkout
<img width="339" alt="Screen Shot 2022-03-08 at 10 02 26 PM" src="https://user-images.githubusercontent.com/82074442/157364778-4718f30e-b130-4066-ae92-f4e8c723c117.png">
<img width="337" alt="Screen Shot 2022-03-08 at 10 02 33 PM" src="https://user-images.githubusercontent.com/82074442/157364777-41ce5098-5d49-4d5b-ab99-1c7726b21583.png">
<img width="343" alt="Screen Shot 2022-03-08 at 10 03 01 PM" src="https://user-images.githubusercontent.com/82074442/157364774-ed397442-b53f-450f-9c4f-927bba170cc5.png">

Technologies

The technologies used were:

React Native on the frontend
Firebase Storage, Authentication, and Cloud Firestore on the backend.
Expo and EAS Build to test and deploy the mobile app.
Google Maps/Geocode API to allow users to view walking distance.
Stripe API for secure payment and checkout.

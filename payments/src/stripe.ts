import Stripe from "stripe";

// console.log('ENV@: ', process.env.STRIPE_KEY);

export const stripe = new Stripe(
    process.env.STRIPE_KEY!,
    {
        apiVersion: '2020-08-27'
    }
);
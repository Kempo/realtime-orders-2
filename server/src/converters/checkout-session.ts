// import { Item } from "@prisma/client";
import Stripe from "stripe";
import { Context } from "../context";
import type { CheckoutSessionPayload } from '../types'; 

/**
 * 
 * Converts the client checkout payload into
 * a preprocessed output for the Stripe API.
 * 
 * @param payload 
 * @param context 
 * @returns properly formed line items response 
 */
export async function convertCheckoutPayloadToStripe(payload: CheckoutSessionPayload[], context: Context) {
  return mapToStripeLineItems(payload);
}

function mapToStripeLineItems(items: any[]): Stripe.Checkout.SessionCreateParams.LineItem[]  {
  return items.map(item => ({
    price: item.priceId,
    quantity: item.quantity
  }));
}
import { ApolloError } from "apollo-server-express";
import { convertCheckoutPayloadToStripe } from './converters';
import { Context } from "./context";

export const resolvers = {
  Query: {
    orders: async (_, __, context: Context, ___) => { 
      const sessions = await context.stripe.checkout.sessions.list({
        expand: ['data.line_items']
      });
      
      // filter here then return!

      // console.log(sessions.data[0].line_items?.data);
      console.log(sessions.data)

      return sessions.data;
    },
    order: async (_, { sessionId }, context: Context, ___) => {
      if(!sessionId) {
        throw new ApolloError('No sessionId specified.')
      }

      const stripeResponse = await context.stripe.checkout.sessions.listLineItems(sessionId);

      // TODO: add `sessionId` to order object. Prefer database to API call
      // const transformed = stripeResponse.data.map(el => ({
      //   title: el.description,
      //   amountTotal: el.amount_total,
      //   quantity: el.quantity
      // }));

      return stripeResponse.data;
    },
    menu: async (_, __, context: Context, ___) => {
      const menuItems = await context.stripe.products.list({
        expand: ['data.default_price']
      });

      console.log(menuItems);

      console.log((menuItems.data[0] as any).default_price);

      return menuItems.data;
    }
  },
  Mutation: {
    createCheckoutSession: async (_, { input }, context: Context, __) => {
      if(!input.lineItems) {
        throw new ApolloError('No line items provided');
      }

      // line item contains `quantity` and `price` (converted from `priceId`) 

      const line_items = await convertCheckoutPayloadToStripe(input.lineItems, context);

      if(line_items.length === 0) {
        throw new ApolloError('Unable to parse line items.');
      }

      const session = await context.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${process.env.BASE_URL}/order?success=true&id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL}`,
        metadata: {
          "created_at": Date.now()
        }
      }).catch(err => { 
        console.log(err);
        throw new ApolloError('Unable to create checkout session.');
      });

      return {
        sessionId: session.id
      }
    }
  }
}
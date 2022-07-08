import { ApolloServer, gql } from 'apollo-server-express';
import express from 'express';
import cors from 'cors';
import { Context, getContext } from './context';
import { resolvers } from './resolvers';
import routes from './routes';

const PORT = process.env.PORT || 4000;
const app = express();

const typeDefs = gql`
  type Order {
    id: Int
    isReady: Boolean
    totalPrice: Int
    createdAt: String 
    lineItems: [LineItem]
    title: String
  }

  type LineItem {
    id: Int
    item: Item
    quantity: Int
  }

  type Item {
    id: Int
    title: String
    unitPrice: Int
    category: String
    description: String
    dietary: [String]
  }

  type Query {
    orders: [StripeCheckoutSession]
    menu: [StripeProduct]
    order(sessionId: String): [StripeLineItemResponse]
  }

  type StripeLineItemExpanded {
    data: [StripeLineItemResponse]
  }

  type StripeCheckoutSession {
    id: String
    customer: String
    payment_status: String
    amount_subtotal: Int
    amount_total: Int
    livemode: Boolean
    status: String
    line_items: StripeLineItemExpanded
    metadata: StripeCheckoutSessionMetadata
  }

  type StripeCheckoutSessionMetadata {
    created_at: Int
  }

  type StripeProduct {
    id: String
    name: String
    description: String
    metadata: StripeProductMetadata
    active: Boolean
    default_price: StripePrice
  }

  type StripePrice {
    id: String
    currency: String
    unit_amount: Int
    product: String
  }

  type StripeProductMetadata {
    Category: String
  }

  type StripeLineItemResponse {
    description: String
    quantity: Int
    amount_total: Int
  }

  input StripeLineItemInput {
    priceId: String
    quantity: Int
  }

  input CreateCheckoutSessionInput {
    lineItems: [StripeLineItemInput]
  }

  type CreateCheckoutSessionPayload {
    sessionId: String
    errors: [String]
  }

  type Mutation {
    createCheckoutSession(input: CreateCheckoutSessionInput): CreateCheckoutSessionPayload
  }
`;

const ctx: Context = getContext();

const server = new ApolloServer({ 
  typeDefs, 
  resolvers,
  context: ctx
});

server.applyMiddleware({ app });

const crossOriginOptions = {
  origin: process.env.DASHBOARD_URL,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}

// Set cross origin requirements
app.use(cors(crossOriginOptions));

app.use('/', routes);

app.listen({ port: PORT }, () => {
  console.log(`🚀  Server ready at port ${PORT} and route ${server.graphqlPath}`);
});

process.on('SIGINT', async () => {
  // await ctx.prisma.$disconnect().then(() => {
  //   console.log('\n👋  Exiting...');
  //   process.exit(1);
  // });
  console.log('\n👋  Exiting...')
  process.exit(1);
});
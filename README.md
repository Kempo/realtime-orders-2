# Real-time Orders

A real-time orders dashboard for a local restaurant in Seattle.

This does not include the customer-facing website.

**Status**: Work in progress. 

## Improvements
- Removed use of Prisma and Postgresql in favor of Stripe Products.

## Client
1. Orders Dashboard (dynamic)
2. ~~Customer-Facing Website (static)~~

Stack: Next.js, Apollo Client, Stripe

## Server
Stack: Node.js, Apollo Server, Stripe, Express

## Deployment
1. Server is deployed on Heroku using the [Heroku Monorepo buildpack](https://github.com/lstoll/heroku-buildpack-monorepo) with a Postgres database attached.
- Deploy the server to production using: `git push heroku master`
2. Both dashboard and main customer website are deployed on Vercel using sub-directories.

## Running locally
After doing `npm install` for both the `/client` and `/server` directories, create the `.env` file and include the key-values for `STRIPE_TEST_KEY`, `WEBHOOK_SECRET`, `BASE_URL` (the client-facing website), and `DASHBOARD_URL`.

Then navigate to the following subdirectories and run the following commands for each:

1. Orders Dashboard / Customer Website (ports `3001` and `3000`):
```
yarn dev
```
2. Server (on port `4000`): 

```
npm run dev
```

If you're testing out Stripe webhooks, be sure to also run:
```
stripe listen --forward-to localhost:4000/v1/payment/complete
```

Then use the webhook secret in your environment file!

## Migration, Reseeding, and ad-hoc changes

1. To reseed the database: `npx prisma db seed`
2. To run the ad-hoc script: `npx ts-node ad-hoc.ts`
3. Migrations are auto-applied during production deployment
  - To run migrations locally, `npx prisma migrate dev`

### Miscellaneous
- [x] `.gitignore` for all `node_modules`

If dealing with simultaneous client-server changes:
1. Deploy server first (`git commit` and `git push heroku`)
2. Update core seeds after migration is applied
2. Verify server changes
3. Deploy client (`git push master`)
4. Verify client changes

If working on a non-nullable column migration:
1. Add the column as optional or set a default value to it (migration)
2. Modify the ad-hoc script to update values
3. Run it locally
4. Confirm changes and then deploy to server
5. Run script on production
5. Revert the column back with another migration
6. Run it locally 
7. Deploy after verification

### To address
1. Multi-restaurant integration
2. Next.js API in-house routes vs. separate server-client architecture
- Related: hefty, opaque Apollo client implementation for client-side fetching
3. Stripe and Prisma model misalignment (eg. line items and `StripeLineItemResponse` type)

### Answered
1. How should a restaurant owner update their menu?
- Manual in-line updates through a reseeding procedure (soon to be on Stripe)
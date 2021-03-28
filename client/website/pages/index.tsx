import Head from 'next/head'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { gql, useMutation } from '@apollo/client'
import client from '../lib/apolloClient'
import styles from '../styles/Home.module.css'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_TEST_STRIPE_KEY);

interface LineItem {
  itemId: number;
  quantity: number;
}

function formatUnitPrice(unitPrice) {
  return (unitPrice / 100);
}

const CREATE_CHECKOUT_MUTATION = gql`
  mutation CreateCheckout($lineItems: [LineItemInput]) {
    createCheckoutSession(input: {
      lineItems: $lineItems
    }) {
      sessionId
    }
  }
`;

export default function Home(props) {

  const [cart, updateCart] = useState<LineItem[]>([]);
  const [createCheckoutSession] = useMutation(CREATE_CHECKOUT_MUTATION, { 
    client
  });

  async function handleClick(_) {
    // TODO: refactor out into singleton
    const stripe = await stripePromise;

    const { data } = await createCheckoutSession({
      variables: {
        lineItems: cart
      }
    });

    // When the customer clicks on the button, redirect them to Checkout.
    const result = await stripe.redirectToCheckout({
      sessionId: data.createCheckoutSession.sessionId,
    });

    if (result.error) {
      console.log(result.error.message);
      // If `redirectToCheckout` fails due to a browser or network
      // error, display the localized error message to your customer
      // using `result.error.message`.
    }
  }

  function onUpdateOrder(itemId) {
    return (event) => {
      const quantity: number = parseInt(event.target.value);

      const isTracked = cart.some(item => item.itemId === itemId);

      if(quantity === 0 && isTracked) {
        // remove item from cart
        const updated = cart.reduce((prev, current) => {
          return current.itemId !== itemId ? [...prev, current] : prev;
        }, []);

        updateCart(updated);
      }else if (quantity > 0 && !isTracked) {

        // append item to the cart
        updateCart([...cart, { itemId: itemId, quantity }])
      }else if (quantity > 0 && isTracked) {

        // update item quantity in the cart
        updateCart(cart.map(lineItem => lineItem.itemId === itemId ? { itemId: itemId, quantity } : lineItem))
      }
    };
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Cedars of Lebanon</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>Menu</h1>
        <ul>
          {
            props.menu.map(item => (
              <li key={`${item.title}-${item.id}`}>
                <h4>{item.title}</h4>
                <p>${formatUnitPrice(item.unitPrice)}</p>
                <label htmlFor={`${item.id}-quantity`}>Quantity:</label>
                <input type="number" id={`${item.id}-quantity`} min={0} step={1} defaultValue={0} onChange={onUpdateOrder(item.id)} />
              </li>
            ))
          }
        </ul>
        <button onClick={handleClick}>
          Checkout
        </button>
      </main>

      <footer className={styles.footer}>
        <p>Made by K.</p>
      </footer>
    </div>
  )
}

export async function getStaticProps(context) {
  const { data, error } = await client.query(
    {
      query: gql`
        query MenuItems {
          menu {
            id
            title
            unitPrice
          }
        }
      `
    }
  )

  if (error) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      ...data
    },
  }
}
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { gql } from '@apollo/client';
import styles from '../styles/Order.module.css';
import client from '../lib/apolloClient';
import formatter from '../lib/dollarFormatter';


const FETCH_ORDER_DETAILS = gql`
query fetchOrderDetails($sessionId: String) {
  order(sessionId: $sessionId) {
    title
		quantity
    amountTotal
  }
}
`

interface OrderResponse {
  order: MenuItemType[];
}

interface MenuItemType {
  title: string;
  quantity: number;
  amountTotal: number;
}

export default function Order() {
  const [status, setStatus] = useState({
    lineItems: [],
    loading: true
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    async function fetch() {
      if(params.get('id')) {
        try {
          const queryResponse = await client.query<OrderResponse>({
            query: FETCH_ORDER_DETAILS,
            variables: {
              sessionId: params.get('id')
            }
          })

          setStatus({
            lineItems: queryResponse.data.order,
            loading: false
          });

        }catch(err) {
          setStatus({
            lineItems: [],
            loading: false
          });
        } 
      }
    }

    fetch();
  }, []);


  return (
    <div className={styles.container}>
      <div className={styles.order}>
        <div className={styles.logo}>
          <Image src="/main.svg" alt="Cedars of Lebanon Logo" width="490" height="320" />
        </div>
        { 
          status.loading ? 
            <Loading /> : 
            (status.lineItems.length === 0 ? <Error /> : <Success order={status.lineItems} />)
        }
      </div>
    </div>
  )
}

function Error() {
  return (
    <React.Fragment>
      <h1>Whoops!</h1>
      <p>Something strange happened. <br /> Text {process.env.NEXT_PUBLIC_PHONE_NUMBER} for help or swing by Cedars of Lebanon!</p>
    </React.Fragment>
  )
}

function Loading() {
  return (
    <React.Fragment>
      <h1>Loading...</h1>
      <p>This might take a little longer than usual. Thank you for being patient!</p>
    </React.Fragment>
  );
}

function Success({ order }:{ order: MenuItemType[] }) {

  const totalPrice = order.reduce((prev, cur) => {
    return prev + (cur.amountTotal);
  }, 0);

  return (
    <React.Fragment>
      <h1 className={styles.summaryTitle}>Thank you for supporting!</h1>
      <hr />
      <p>Orders take on average about 15 minutes to complete. <br /> Please come pick it up when you're ready. </p>
      <div className={styles.receipt}>
        <h2>Order Summary</h2>
        <table>
          <tr>
            <th>Item</th>
            <th>Price</th>
          </tr>
          {
            order.length > 0 && order.map((el: MenuItemType, i: number) =>  
              <tr key={i}>
                <td className={styles.itemName}>{el.quantity}x {el.title}</td>
                <td className={styles.amountTotal}>{formatter.format(el.amountTotal / 100)}</td>
              </tr>
            )
          }
          <tr>
            <td><b>Total:</b></td>
            <td className={styles.amountTotal}><b>{formatter.format(totalPrice / 100)}</b></td>
          </tr>
        </table>
      </div>
      <Instructions />
    </React.Fragment>
  )
}

function Instructions() {
  return (
    <div>
      <h2>Pick your order up at:</h2>
      <a href="https://www.google.com/maps/place/Cedars+of+Lebanon/@47.6597139,-122.3134208,19.17z/data=!4m5!3m4!1s0x0:0x91c70c3f32afc6f5!8m2!3d47.6597151!4d-122.3135296" target="_blank" rel="noopener noreferrer">1319 NE 43rd St, Seattle, WA 98105</a>
      <p>(206) 632-7708</p>
      <p>When you arrive, please tell the cashier your order.</p>
    </div>
  )
}
import styles from '../../styles/Order.module.css';

const formatDate = (timestamp: string) => (new Date(parseInt(timestamp)));

export default function Order({ id, amount_total, description, created_at, line_items  }) {
  return (
    <div className={styles.order}>
      <div className={styles.timestamp}>
        <p className={styles.date}>{formatDate(created_at).toLocaleDateString('en-US')}</p>
        <p className={styles.time}>{formatDate(created_at).toLocaleTimeString('en-US')}</p>
      </div>
      {
        description && <p className={styles.orderTitle}>{description}</p>
      }
      <br />
      <br />
      <ul>
        {line_items.data.map((lineItem, i) => <LineItem lineItem={lineItem} index={i} />)}
        <li className={styles.price}>
          <p>{amount_total}</p>
        </li>
      </ul>
      <br />
      <p className={styles.badge}>
        AUTHORIZED
      </p>
    </div>
  )
}

function LineItem({ lineItem, index }) {
  return (
    <li key={`${lineItem.description}-${index}`}>
        <p><b>{lineItem.quantity}</b> {lineItem.description}</p>
    </li>
  )
}
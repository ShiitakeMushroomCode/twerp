import { FaFax, FaPhone } from 'react-icons/fa';
import styles from './ClientInfo.module.css';

export default function ClientInfo({ client_name, client_address, client_tel, client_fax }) {
  return (
    <div>
      <span className={styles.title}>거래명세서</span>
      <div className={styles.container}>
        <span className={styles.clientName}>{client_name}</span>
        <span className={styles.clientAddress}>{client_address}</span>
        <div className={styles.contactInfo}>
          <span>
            <FaPhone style={{ marginRight: '4px' }} />
            TEL: {client_tel}
          </span>
          <span>
            <FaFax style={{ marginRight: '4px' }} />
            FAX: {client_fax}
          </span>
        </div>
      </div>
    </div>
  );
}

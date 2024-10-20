import styles from '@/styles/modal.module.css';

export default function Modal({ message, onClose }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <pre>{message}</pre>
        <button onClick={onClose}>확인</button>
      </div>
    </div>
  );
}

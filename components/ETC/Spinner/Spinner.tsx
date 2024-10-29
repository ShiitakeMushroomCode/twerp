'use client';

import { ClipLoader } from 'react-spinners';
import styles from './Spinner.module.css';

export default function Spinner() {
  return (
    <div className={styles.spinnerContainer}>
      <ClipLoader color="#499eff" size={50} />
      <p className={styles.loadingText}>로딩 중...</p>
    </div>
  );
}

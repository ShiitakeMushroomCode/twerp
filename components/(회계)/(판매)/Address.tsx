'use client';
import { useState } from 'react';
import PostCode from 'react-daum-postcode';
import styles from './Address.module.css';

interface AddressProps {
  isSearch: boolean;
  setIsSearch: (isSearch: boolean) => void;
  setBusinessAddress: (address: string) => void;
}

interface PostCodeData {
  address: string;
  addressType: string;
  bname: string;
  buildingName: string;
  zonecode: string;
}

export default function Address({ isSearch, setIsSearch, setBusinessAddress }: AddressProps) {
  const [addrNum, setAddrNum] = useState('');
  const [addr, setAddr] = useState('');
  const [detailAddr, setDetailAddr] = useState('');
  const [showAddrModal, setShowAddrModal] = useState(false);

  function openAddrModal() {
    setAddrNum('');
    setAddr('');
    setDetailAddr('');
    setShowAddrModal(true);
  }

  function closeAddrModal() {
    setShowAddrModal(false);
  }

  function submit() {
    const fullAddress = `${addr} ${detailAddr}`.trim();
    setBusinessAddress(fullAddress);
    closeAddrModal();
    setIsSearch(false);
  }

  function handleComplete(data: PostCodeData) {
    let fullAddress = data.address;
    let extraAddress = '';

    const { addressType, bname, buildingName, zonecode } = data;

    if (addressType === 'R') {
      if (bname) {
        extraAddress += bname;
      }
      if (buildingName) {
        extraAddress += `${extraAddress ? ', ' : ''}${buildingName}`;
      }
      fullAddress += `${extraAddress ? ` ${extraAddress}` : ''}`;
    }

    setAddrNum(zonecode);
    setAddr(fullAddress);
    setShowAddrModal(false);
  }

  function handleDetailAddr(event: React.ChangeEvent<HTMLInputElement>) {
    setDetailAddr(event.target.value);
  }

  return (
    <div className={styles.modalOverlay} onClick={() => setIsSearch(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.addressSection}>
          <div className={styles.addrNum}>{addrNum}</div>
          <button onClick={openAddrModal} type="button" className={styles.openButton}>
            주소 찾기
          </button>
        </div>
        {showAddrModal && (
          <div className={styles.modalOverlay} onClick={closeAddrModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeButton} onClick={closeAddrModal}>
                &times;
              </button>
              <PostCode onComplete={handleComplete} />
            </div>
          </div>
        )}
        <div className={styles.addressDisplay}>{addr}</div>
        <div>
          <input
            id="detailAddress"
            name="detailAddress"
            onBlur={handleDetailAddr}
            type="text"
            placeholder="상세주소를 입력해주세요."
            className={styles.detailInput}
            value={detailAddr}
            onChange={handleDetailAddr}
          />
          <button type="button" className={styles.submit} onClick={submit}>
            완료
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';
import styles from '@/styles/Address.module.css';
import { useState } from 'react';
import PostCode from 'react-daum-postcode';

interface AddressProps {
  addrNum: string;
  setAddrNum: (addrNum: string) => void;
  addr: string;
  setAddr: (addr: string) => void;
  detailAddr: string;
  setDetailAddr: (detailAddr: string) => void;
  isSearch: boolean;
  setIsSearch: (isSearch: boolean) => void;
  formData: any;
  setFormData: (formData: any) => void;
}

interface PostCodeData {
  address: string;
  addressType: string;
  bname: string;
  buildingName: string;
  zonecode: string;
}

export default function Address({
  setIsSearch,
  addrNum,
  setAddrNum,
  addr,
  setAddr,
  detailAddr,
  setDetailAddr,
  formData,
  setFormData,
}: AddressProps) {
  const [showAddrModal, setShowAddrModal] = useState(false);

  function openAddrModal() {
    setAddrNum('');
    setAddr('');
    setDetailAddr('');
    setShowAddrModal(true);
  }

  function closeAddrModal() {
    setAddrNum('');
    setAddr('');
    setDetailAddr('');
    setShowAddrModal(false);
  }

  function submit() {
    setFormData((prev) => ({
      ...prev,
      business_address: `${addr} ${detailAddr}`,
    }));
    closeAddrModal();
    setIsSearch(false);
  }

  async function handleComplete(data: PostCodeData) {
    let fullAddress = data.address;
    let extraAddress = '';

    const { addressType, bname, buildingName, zonecode } = data;

    if (addressType === 'R') {
      if (bname !== '') {
        extraAddress += bname;
      }
      if (buildingName !== '') {
        extraAddress += `${extraAddress !== '' ? ', ' : ''}${buildingName}`;
      }
      fullAddress += `${extraAddress !== '' ? ` ${extraAddress}` : ''}`;
    }
    setAddrNum(zonecode);
    setAddr(fullAddress);

    setShowAddrModal(false);
  }

  function handleDetailAddr(event: React.ChangeEvent<HTMLInputElement>) {
    setDetailAddr(event.target.value);
  }

  return (
    <div
      className={styles.modalOverlay}
      onClick={() => {
        setIsSearch(false);
      }}
    >
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
            onBlur={handleDetailAddr}
            type="text"
            placeholder="상세주소를 입력해주세요."
            className={styles.detailInput}
            value={detailAddr}
            onChange={(e) => setDetailAddr(e.target.value)}
          />
          <button type="button" className={styles.submit} onClick={submit}>
            완료
          </button>
        </div>
      </div>
    </div>
  );
}

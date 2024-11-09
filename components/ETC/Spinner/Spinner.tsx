'use client';
import { Suspense } from 'react';
import { ClipLoader } from 'react-spinners';
import styled from 'styled-components';

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const LoadingText = styled.p`
  margin-top: 10px;
  font-size: 1.2rem;
  color: #555;
`;

export default function Spinner() {
  return (
    <Suspense
      fallback={
        <SpinnerContainer>
          <ClipLoader color='#499eff' size={50} />
          <LoadingText>로딩 중...</LoadingText>
        </SpinnerContainer>
      }
    ></Suspense>
  );
}

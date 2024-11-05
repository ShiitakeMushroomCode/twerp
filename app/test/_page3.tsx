'use client';
import { motion, useAnimation } from "framer-motion";
import { useState } from "react";
import styled from "styled-components";

const SlotMachine = () => {
  const nitems = [
    { name: "사과", image: "/images/apple.jpg" },
    { name: "포도", image: "/images/grape.jpg" },
    { name: "딸기", image: "/images/strawberry.jpg" },
    { name: "배", image: "/images/pear.jpg" },
    { name: "복숭아", image: "/images/peach.jpg" },
    { name: "수박", image: "/images/watermelon.jpg" },
    { name: "멜론", image: "/images/melon.jpg" },
    { name: "망고", image: "/images/mango.jpg" },
  ];

  // 슬롯 머신에 표시될 아이템을 여러 번 반복하여 애니메이션 시 자연스러운 스크롤 효과를 줍니다.
  const items = [...nitems, ...nitems, ...nitems, ...nitems, ...nitems, ...nitems, ...nitems, ...nitems, ...nitems]; // 충분히 반복하여 부드러운 스크롤링 확보

  const controls = useAnimation();
  const [isRunning, setIsRunning] = useState(false);
  const [animationY, setAnimationY] = useState(0);

  const itemHeight = 160; // 각 아이템의 높이 (px)
  const totalSpins = 5; // 슬롯이 회전할 전체 회전 수

  const startSlot = async () => {
    if (isRunning) return;
    setIsRunning(true);

    // 랜덤하게 최종 목표 아이템을 선택
    const randomIndex = Math.floor(Math.random() * nitems.length);
    // 총 회전할 아이템 수 계산: 전체 아이템 수 * totalSpins + 랜덤 인덱스
    const finalPosition = (nitems.length * totalSpins + randomIndex) * itemHeight;

    try {
      // **1단계: 빠른 회전**
      await controls.start({
        y: -finalPosition + (itemHeight * nitems.length),
        transition: {
          duration: 2, // 빠른 회전 지속 시간 (초)
          ease: "linear",
        },
      });

      // **2단계: 천천히 멈추기**
      await controls.start({
        y: -finalPosition,
        transition: {
          duration: 1.5, // 천천히 멈추는 지속 시간 (초)
          ease: "easeOut",
        },
      });

      // 애니메이션이 완료되면 슬롯 위치 리셋하여 무한 스크롤 효과 유지
      const resetPosition = finalPosition % (nitems.length * itemHeight);
      controls.set({ y: -resetPosition });
    } catch (error) {
      console.error("애니메이션 에러:", error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Container>
      <SlotContainer>
        <motion.div
          animate={controls}
          initial={{ y: 0 }}
          style={{ display: "flex", flexDirection: "column" }}
        >
          {items.map((item, index) => (
            <SlotItemBox key={index}>
              <img
                src={item.image}
                alt={item.name}
                style={{ width: "120px", height: "120px", marginBottom: "10px" }}
              />
              <SlotItemText>{item.name}</SlotItemText>
            </SlotItemBox>
          ))}
        </motion.div>
      </SlotContainer>
      <StartButton onClick={startSlot} disabled={isRunning}>
        {isRunning ? "스피닝..." : "시작"}
      </StartButton>
    </Container>
  );
};

// 스타일 정의
const Container = styled.div`
  width: 420px;
  height: 820px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const SlotContainer = styled.div`
  width: 200px;
  height: 160px;
  overflow: hidden;
  border: 2px solid #333;
  border-radius: 10px;
  background-color: #000;
  position: relative;
`;

const SlotItemBox = styled.div`
  color: white;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 160px;
`;

const SlotItemText = styled.div`
  font-size: 18px;
  margin-top: 5px;
`;

const StartButton = styled.button`
  background-color: #4caf50;
  color: white;
  font-size: 20px;
  font-weight: bold;
  width: 200px;
  height: 50px;
  margin-top: 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s, opacity 0.3s;

  &:hover {
    background-color: #45a049;
    opacity: 0.9;
  }

  &:disabled {
    background-color: #888;
    cursor: not-allowed;
  }
`;

export default SlotMachine;

import { useImplement } from '@cybermp/rpc-router-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import sybauImgSrc from '../../assets/images/sybau.jpg?webp&imagetools';
import { sybauContract } from './contract';

export const Sybau = () => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number>(null);

  useImplement(sybauContract, () => {
    setIsVisible(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed bottom-10 left-0 right-0 flex justify-center z-[9999] pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.img
            src={sybauImgSrc}
            alt="Notification"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="max-w-[200px] h-auto rounded-lg shadow-2xl pointer-events-auto"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

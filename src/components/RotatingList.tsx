'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Participant } from '@/lib/csvParser';
import { useState, useEffect, useRef } from 'react';

interface RotatingListProps {
  participants: Participant[];
  isSpinning: boolean;
  winner?: Participant | null;
  onSpinComplete?: () => void;
}

export default function RotatingList({ participants, isSpinning, winner, onSpinComplete }: RotatingListProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleParticipants, setVisibleParticipants] = useState<Participant[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Use refs to avoid stale closures
  const participantsRef = useRef(participants);
  const isSpinningRef = useRef(isSpinning);
  const winnerRef = useRef(winner);
  const spinningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Show 9 participants at a time (4 above, 1 center, 4 below) - increased from 7
  const visibleCount = 9;
  const centerIndex = Math.floor(visibleCount / 2);

  // Update refs when props change
  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    isSpinningRef.current = isSpinning;
  }, [isSpinning]);

  useEffect(() => {
    winnerRef.current = winner;
  }, [winner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (spinningTimeoutRef.current) {
        clearTimeout(spinningTimeoutRef.current);
        spinningTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (participants.length === 0) {
      setVisibleParticipants([]);
      return;
    }

    const getVisibleParticipants = (centerIdx: number) => {
      const visible: Participant[] = [];
      for (let i = 0; i < visibleCount; i++) {
        const participantIndex = (centerIdx - centerIndex + i + participants.length) % participants.length;
        visible.push(participants[participantIndex]);
      }
      return visible;
    };

    setVisibleParticipants(getVisibleParticipants(currentIndex));
  }, [currentIndex, participants, centerIndex, visibleCount]);

  useEffect(() => {
    // If not spinning or insufficient participants, stop everything
    if (!isSpinning || participants.length < 2) {
      setIsComplete(false);
      if (spinningTimeoutRef.current) {
        clearTimeout(spinningTimeoutRef.current);
        spinningTimeoutRef.current = null;
      }
      return;
    }

    // Clear any existing timeout
    if (spinningTimeoutRef.current) {
      clearTimeout(spinningTimeoutRef.current);
    }

    setIsComplete(false);

    let speed = 300; // Slower initial speed
    const minSpinTime = 5000; // 5 seconds minimum
    const startTime = Date.now();

    const spin = () => {
      const elapsedTime = Date.now() - startTime;

      // Always rotate the list while spinning
      setCurrentIndex(prevIndex => (prevIndex + 1) % participants.length);

      // Check if we should stop spinning
      if (winner && elapsedTime >= minSpinTime) {
        // Find winner index and position the list there
        const winnerIndex = participants.findIndex(p => p.id === winner.id);
        if (winnerIndex !== -1) {
          setCurrentIndex(winnerIndex);
          setIsComplete(true);

          // Notify completion after a short delay
          setTimeout(() => {
            onSpinComplete?.();
          }, 1000);

          return; // Stop spinning
        }
      }

      // Continue spinning if conditions not met
      if (winner && elapsedTime >= minSpinTime - 1500) {
        speed = Math.min(speed + 50, 600); // Slow down more gradually
      }

      spinningTimeoutRef.current = setTimeout(spin, speed);
    };

    // Start the spinning animation
    spin();

    // Cleanup
    return () => {
      if (spinningTimeoutRef.current) {
        clearTimeout(spinningTimeoutRef.current);
        spinningTimeoutRef.current = null;
      }
    };
  }, [isSpinning, participants, winner, onSpinComplete]);

  if (participants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-gray-500">
          <p className="text-lg mb-2">📋</p>
          <p>لا توجد مشاركين في السحب</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white via-green-50/30 to-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl lg:shadow-2xl border border-green-200 sm:border-2 sm:border-green-300 p-2 sm:p-4 lg:p-6 h-full flex flex-col backdrop-blur-sm">
      <motion.div
        className="text-center mb-2 sm:mb-4 lg:mb-6"
        animate={isSpinning ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 1, repeat: isSpinning ? Infinity : 0 }}
      >
        <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-800 mb-1 sm:mb-2 lg:mb-3 drop-shadow-sm">
          {isSpinning ? '🎲 جاري السحب...' : isComplete ? '🎉 انتهى السحب!' : '🎯 المشاركين في السحب'}
        </h3>
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${isSpinning ? 'bg-green-500 animate-pulse shadow-lg' : 'bg-gray-300'}`}></div>
          <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${isSpinning ? 'bg-green-500 animate-pulse shadow-lg' : 'bg-gray-300'}`} style={{ animationDelay: '0.2s' }}></div>
          <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${isSpinning ? 'bg-green-500 animate-pulse shadow-lg' : 'bg-gray-300'}`} style={{ animationDelay: '0.4s' }}></div>
        </div>
      </motion.div>

      <div className="relative flex-1 overflow-hidden rounded-2xl border-2 border-green-300 bg-gradient-to-b from-green-50/40 to-white shadow-inner">
        {/* Rotating list - scrolling from bottom to top */}
        <div className="absolute inset-0 flex flex-col justify-start p-4 overflow-hidden">
          <AnimatePresence mode="wait">
            {visibleParticipants.map((participant, index) => {
              const isCenterItem = index === centerIndex;
              const isWinnerItem = winner && participant.id === winner.id && isComplete;

              return (
                <motion.div
                  key={`${participant.id}-${currentIndex}-${index}`}
                  initial={{ opacity: 0.8, y: 100, scale: 0.95 }}
                  animate={{
                    opacity: isCenterItem ? 1 : 0.85,
                    y: 0,
                    scale: isCenterItem ? 1.05 : 0.98
                  }}
                  exit={{ opacity: 0.7, y: -100, scale: 0.9 }}
                  transition={{
                    duration: isSpinning ? 0.25 : 0.5,
                    ease: isSpinning ? "easeInOut" : "easeOut",
                    opacity: {
                      duration: isSpinning ? 0.15 : 0.3,
                      ease: "easeInOut"
                    },
                    scale: {
                      duration: isSpinning ? 0.25 : 0.5,
                      ease: "easeOut"
                    },
                    y: {
                      duration: isSpinning ? 0.25 : 0.4,
                      ease: isSpinning ? "easeInOut" : "backOut"
                    }
                  }}
                  className={`py-2 px-3 sm:py-3 sm:px-5 lg:py-5 lg:px-7 mx-1 sm:mx-2 lg:mx-4 mb-1 sm:mb-2 lg:mb-4 rounded-lg sm:rounded-xl lg:rounded-2xl border sm:border-2 transition-all duration-300 backdrop-blur-sm ${
                    isWinnerItem
                      ? 'bg-gradient-to-r from-green-100 via-green-50 to-green-100 border-green-500 shadow-lg sm:shadow-xl lg:shadow-2xl ring-2 sm:ring-4 ring-green-300/50 transform scale-102 sm:scale-105'
                      : isCenterItem
                        ? 'bg-gradient-to-r from-green-50/90 via-white to-green-50/90 border-green-400 shadow-md sm:shadow-lg lg:shadow-xl ring-1 sm:ring-2 ring-green-200 transform scale-101 sm:scale-102'
                        : 'bg-white/80 border-gray-300 shadow-sm sm:shadow-md lg:shadow-lg hover:shadow-md sm:hover:shadow-lg lg:hover:shadow-xl hover:bg-white/95 hover:border-green-200'
                  }`}
                >
                  <div className="text-center">
                    {/* Name */}
                    <p className={`font-bold mb-1 sm:mb-2 ${
                      isWinnerItem
                        ? 'text-green-800 text-sm sm:text-base lg:text-xl'
                        : isCenterItem
                          ? 'text-green-700 text-sm sm:text-base lg:text-lg'
                          : 'text-gray-600 text-xs sm:text-sm lg:text-base'
                    }`}>
                      {participant.name}
                    </p>

                    {isWinnerItem && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: [0, 1.2, 1],
                          opacity: [0, 1, 1]
                        }}
                        transition={{
                          duration: 0.6,
                          ease: "easeOut",
                          times: [0, 0.6, 1]
                        }}
                        className="mt-3"
                      >
                        <motion.div
                          className="flex justify-center gap-1"
                          animate={{
                            y: [0, -5, 0],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                            ease: "easeInOut"
                          }}
                        >
                          <motion.span
                            className="text-2xl"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            🎉
                          </motion.span>
                          <motion.span
                            className="text-2xl"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          >
                            👑
                          </motion.span>
                          <motion.span
                            className="text-2xl"
                            animate={{ rotate: [0, -10, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            🎉
                          </motion.span>
                        </motion.div>
                        <motion.p
                          className="text-green-700 font-bold text-lg mt-2"
                          animate={{
                            opacity: [0.8, 1, 0.8],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "easeInOut"
                          }}
                        >
                          الفائز!
                        </motion.p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>



        {/* Subtle gradient overlays for smoother edges */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/80 via-white/40 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/80 via-white/40 to-transparent pointer-events-none" />
      </div>

      {/* Status */}
      <div className="mt-8 text-center">
        {isSpinning ? (
          <motion.div
            animate={{
              opacity: [1, 0.8, 1],
              scale: [1, 1.02, 1]
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut"
            }}
            className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200 shadow-lg"
          >
            <div className="flex items-center justify-center space-x-3 space-x-reverse mb-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                className="w-7 h-7 border-4 border-green-600/20 border-t-green-600 border-r-green-500 rounded-full shadow-sm"
              />
              <motion.span
                className="text-green-700 font-bold text-lg"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                جاري اختيار الفائز...
              </motion.span>
            </div>
            <motion.p
              className="text-green-600 text-sm"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
              يرجى الانتظار حتى توقف القائمة
            </motion.p>
          </motion.div>
        ) : winner && isComplete ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-100 to-green-50 rounded-xl p-6 border-2 border-green-300 shadow-lg"
          >
            <div className="space-y-3">
              <p className="text-green-600 font-bold text-lg">🎊 تم اختيار الفائز! 🎊</p>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-2xl font-bold text-green-800 mb-2">{winner.name}</p>
                {winner.phone && (
                  <p className="text-green-700 font-mono">📱 {winner.phone}</p>
                )}
                {winner.email && (
                  <p className="text-green-600 text-sm font-mono mt-1">📧 {winner.email}</p>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-gray-600 mb-2">
              📊 إجمالي المشاركين: <span className="font-bold text-green-700 text-lg">{participants.length}</span>
            </p>
            <p className="text-sm">اضغط &ldquo;ابدأ السحب&rdquo; لبدء الاختيار العشوائي</p>
          </div>
        )}
      </div>
    </div>
  );
}
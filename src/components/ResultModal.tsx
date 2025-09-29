'use client';

import { motion } from 'framer-motion';
import { Participant } from '@/lib/csvParser';
import { useEffect, useState } from 'react';

interface ResultModalProps {
  winner: Participant | null;
  isVisible: boolean;
  onClose: () => void;
  drawDetails?: {
    seed: number;
    timestamp: string;
    winnerIndex: number;
    totalParticipants: number;
  } | null;
}

export default function ResultModal({ winner, isVisible, onClose, drawDetails }: ResultModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible && winner) {
      setShowConfetti(true);
      // Optional: Add sound effect here
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, winner]);

  if (!isVisible || !winner) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 100 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Celebration Icon */}
        <motion.div
          animate={{
            rotate: [0, -10, 10, -10, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { repeat: 2, duration: 0.5 },
            scale: { delay: 0.5, duration: 0.3 }
          }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>

        {/* Winner Announcement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            مبروك!
          </h2>
          <p className="text-gray-600 mb-4">الفائز في السحب هو:</p>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6 mb-6 shadow-lg"
          >
            <p className="text-3xl font-bold text-green-800 mb-4">
              {winner.name}
            </p>

            {/* Winner Details */}
            <div className="space-y-3 border-t border-green-200 pt-4">
              {winner.phone && (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-green-600 text-xl">📱</span>
                  <span className="text-green-700 font-mono text-lg font-medium">
                    {winner.phone}
                  </span>
                </div>
              )}
              {winner.email && (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-green-600 text-xl">📧</span>
                  <span className="text-green-600 font-mono text-sm break-all">
                    {winner.email}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Draw Details */}
        {drawDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-50 rounded-lg p-4 mb-6 text-right text-sm space-y-2"
          >
            <h3 className="font-bold text-gray-700 text-center mb-3">تفاصيل السحب:</h3>
            <div className="flex justify-between">
              <span className="text-gray-600">المؤشر:</span>
              <span className="font-mono">{drawDetails.seed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">الوقت:</span>
              <span className="font-mono">
                {new Date(drawDetails.timestamp).toLocaleString('ar-SA')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">رقم الفائز:</span>
              <span className="font-mono">{drawDetails.winnerIndex + 1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">إجمالي المشاركين:</span>
              <span className="font-mono">{drawDetails.totalParticipants}</span>
            </div>
          </motion.div>
        )}

        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
        >
          إغلاق
        </motion.button>
      </motion.div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-200/20 to-transparent animate-pulse" />
          {/* Simplified confetti using CSS animations */}
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                rotate: 0,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{
                y: window.innerHeight + 10,
                rotate: Math.random() * 360,
                x: Math.random() * window.innerWidth
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                ease: "linear",
                delay: Math.random() * 2
              }}
              className="absolute w-3 h-3 bg-green-400 rounded-full"
              style={{
                backgroundColor: ['#16a34a', '#22c55e', '#4ade80', '#84cc16'][Math.floor(Math.random() * 4)]
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
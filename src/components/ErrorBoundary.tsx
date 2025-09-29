'use client';

import { motion } from 'framer-motion';

interface ErrorBoundaryProps {
  error: Error | null;
  onReset?: () => void;
}

export default function ErrorBoundary({ error, onReset }: ErrorBoundaryProps) {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
          className="text-6xl mb-4"
        >
          😞
        </motion.div>

        <h2 className="text-2xl font-bold text-red-600 mb-4">
          حدث خطأ!
        </h2>

        <p className="text-gray-600 mb-6">
          {error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'}
        </p>

        {onReset && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300"
          >
            إعادة المحاولة
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ParticipantList from '@/components/ParticipantList';
import RotatingList from '@/components/RotatingList';
import ResultModal from '@/components/ResultModal';
import Controls from '@/components/Controls';
import Statistics from '@/components/Statistics';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Participant } from '@/lib/csvParser';

interface DrawResult {
  winner: Participant;
  seed: number;
  timestamp: string;
  winnerIndex: number;
  totalParticipants: number;
}

export default function RafflePage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [drawDetails, setDrawDetails] = useState<DrawResult | null>(null);
  const [showTransparency, setShowTransparency] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load participants on component mount
  useEffect(() => {
    async function loadParticipants() {
      try {
        const response = await fetch('/api/draw');
        if (!response.ok) {
          throw new Error('فشل في تحميل المشاركين');
        }
        const data = await response.json();
        setParticipants(data.participants);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
      } finally {
        setLoading(false);
      }
    }

    loadParticipants();
  }, []);

  const handleStartDraw = async () => {
    if (participants.length < 2 || isDrawing) return;

    setIsDrawing(true);
    setWinner(null);
    setDrawDetails(null);
    setShowResult(false);

    try {
      // Generate seed for transparency
      const seed = Date.now();

      // Call API to get winner
      const response = await fetch('/api/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed })
      });

      if (!response.ok) {
        throw new Error('فشل في إجراء السحب');
      }

      const result = await response.json();

      // Set winner and details immediately - let the RotatingList handle the timing
      setWinner(result.winner);
      setDrawDetails(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء السحب');
      setIsDrawing(false);
    }
  };

  const handleReset = () => {
    setWinner(null);
    setDrawDetails(null);
    setShowResult(false);
    setIsDrawing(false);
  };

  const handleCloseResult = () => {
    setShowResult(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-2xl shadow-2xl p-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full mx-auto mb-4"
          />
          <p className="text-green-700 text-lg font-medium">جاري تحميل المشاركين...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorBoundary
        error={new Error(error || 'حدث خطأ غير معروف')}
        onReset={() => {
          setError(null);
          setLoading(true);
          // Reload participants
          (async () => {
            try {
              const response = await fetch('/api/draw');
              if (!response.ok) {
                throw new Error('فشل في تحميل المشاركين');
              }
              const data = await response.json();
              setParticipants(data.participants);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
            } finally {
              setLoading(false);
            }
          })();
        }}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-600 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-700 mb-2">حدث خطأ</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-green-700 to-green-600 shadow-xl border-b-2 sm:border-b-4 border-green-800">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">
              🎯 السحب العشوائي
            </h1>
            <p className="text-green-100 text-xs sm:text-sm md:text-base lg:text-lg opacity-90 px-2">
              صفحة السحب للمناسبات والفعاليات - ({participants.length} مشارك)
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 lg:py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
          {/* Left Column - Controls and Participant List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2 sm:space-y-4 lg:space-y-6 order-2 lg:order-1"
          >
            {/* Controls */}
            <Controls
              onStartDraw={handleStartDraw}
              onReset={handleReset}
              isDrawing={isDrawing}
              isDisabled={participants.length < 2}
              participantCount={participants.length}
            />

            {/* Statistics */}
            {/* <Statistics
              participants={participants}
              drawDetails={drawDetails}
            /> */}

            {/* Participants List */}
            <ParticipantList
              participants={participants}
              isDrawing={isDrawing}
            />
          </motion.div>

          {/* Right Columns - Rotating List (takes 3/4 of the width) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 flex flex-col items-center space-y-2 sm:space-y-4 lg:space-y-6 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] order-1 lg:order-2"
          >
            <div className="w-full flex-1 min-h-0">
              <RotatingList
                participants={participants}
                isSpinning={isDrawing}
                winner={winner}
                onSpinComplete={() => {
                  setIsDrawing(false);
                  setShowResult(true);
                }}
              />
            </div>

            {/* Transparency Panel Toggle */}
            {drawDetails && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowTransparency(!showTransparency)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1 sm:py-2 px-2 sm:px-4 rounded-md sm:rounded-lg border border-gray-300 transition-colors text-xs sm:text-sm"
              >
                {showTransparency ? 'إخفاء' : 'عرض'} تفاصيل الشفافية
              </motion.button>
            )}

            {/* Transparency Panel */}
            {showTransparency && drawDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
              >
                <h3 className="font-bold text-gray-700 text-center mb-4">
                  🔍 تفاصيل الشفافية
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">المؤشر العشوائي:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                      {drawDetails.seed}
                    </code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">وقت السحب:</span>
                    <span className="font-mono text-xs">
                      {new Date(drawDetails.timestamp).toLocaleString('ar-SA')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">رقم الفائز:</span>
                    <span className="font-bold text-green-700">
                      {drawDetails.winnerIndex + 1} من {drawDetails.totalParticipants}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Result Modal */}
      <ResultModal
        winner={winner}
        isVisible={showResult}
        onClose={handleCloseResult}
        drawDetails={drawDetails}
      />

      {/* Footer */}
      <footer className="bg-gradient-to-r from-green-600 via-green-700 to-green-600 border-t-2 sm:border-t-4 border-green-800 mt-auto shadow-lg sm:shadow-xl lg:shadow-2xl flex-shrink-0">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 lg:py-4">
          <div className="text-center text-green-100">
            <p className="mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base opacity-90 px-2">
              🇸🇦 هذه الصفحة مخصصة لعرض السحب العشوائي بشكل احترافي وشفاف أمام الحضور
            </p>
            <p className="text-xs sm:text-xs lg:text-sm text-green-200 opacity-75">
              تم التطوير باستخدام Next.js • جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

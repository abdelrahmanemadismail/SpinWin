'use client';

import { motion } from 'framer-motion';

interface ControlsProps {
  onStartDraw: () => void;
  onReset: () => void;
  isDrawing: boolean;
  isDisabled: boolean;
  participantCount: number;
}

export default function Controls({
  onStartDraw,
  onReset,
  isDrawing,
  isDisabled,
  participantCount
}: ControlsProps) {
  const canDraw = participantCount >= 2 && !isDisabled;

  return (
    <div className="bg-gradient-to-br from-white via-green-50/20 to-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl lg:shadow-2xl border sm:border-2 border-green-200 sm:border-green-300 p-3 sm:p-4 lg:p-6 backdrop-blur-sm">
      <div className="text-center mb-3 sm:mb-4 lg:mb-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-800 mb-2 sm:mb-3 drop-shadow-sm">
          ⚙️ لوحة التحكم
        </h2>
        <div className="w-8 sm:w-12 lg:w-16 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full mx-auto shadow-sm"></div>
      </div>

      <div className="space-y-4">
        {/* Start Draw Button */}
        <motion.button
          whileHover={canDraw ? { scale: 1.02 } : {}}
          whileTap={canDraw ? { scale: 0.98 } : {}}
          onClick={onStartDraw}
          disabled={!canDraw || isDrawing}
          className={`w-full py-2 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 ${
            canDraw && !isDrawing
              ? 'bg-gradient-to-r from-green-600 via-green-700 to-green-600 hover:from-green-700 hover:via-green-800 hover:to-green-700 text-white shadow-lg sm:shadow-xl lg:shadow-2xl hover:shadow-xl sm:hover:shadow-2xl lg:hover:shadow-3xl ring-1 sm:ring-2 ring-green-300 hover:ring-2 sm:hover:ring-4 hover:ring-green-400 transform hover:scale-102 sm:hover:scale-105'
              : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed shadow-md sm:shadow-lg'
          }`}
        >
          {isDrawing ? (
            <div className="flex items-center justify-center space-x-2 space-x-reverse">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
              <span>جاري السحب...</span>
            </div>
          ) : (
            'ابدأ السحب'
          )}
        </motion.button>

        {/* Reset Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          disabled={isDrawing}
          className={`w-full py-3 px-6 rounded-xl font-medium transition-all ${
            isDrawing
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-sm'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 border border-gray-300 shadow-md hover:shadow-lg'
          }`}
        >
          إعادة تعيين
        </motion.button>

        {/* Status Information */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-100 shadow-sm">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">عدد المشاركين:</span>
              <span className="font-bold text-green-700">{participantCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">الحد الأدنى للسحب:</span>
              <span className="font-mono text-gray-800">2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">حالة السحب:</span>
              <span className={`font-medium ${
                isDrawing
                  ? 'text-yellow-600'
                  : canDraw
                    ? 'text-green-600'
                    : 'text-red-600'
              }`}>
                {isDrawing
                  ? 'جاري السحب'
                  : canDraw
                    ? 'جاهز'
                    : 'غير جاهز'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Warning Messages */}
        {participantCount < 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-right"
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-yellow-600">⚠️</span>
              <span className="text-yellow-700 text-sm">
                يحتاج السحب إلى مشاركين اثنين على الأقل
              </span>
            </div>
          </motion.div>
        )}

        {participantCount === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-right"
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-red-600">❌</span>
              <span className="text-red-700 text-sm">
                لا توجد مشاركين في السحب
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
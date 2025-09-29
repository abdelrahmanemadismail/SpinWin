'use client';

import { motion } from 'framer-motion';
import { Participant } from '@/lib/csvParser';
import { generateParticipantSummary, validateParticipants } from '@/lib/participantUtils';

interface StatisticsProps {
  participants: Participant[];
  drawDetails?: {
    seed: number;
    timestamp: string;
    winnerIndex: number;
    totalParticipants: number;
  } | null;
}

export default function Statistics({ participants, drawDetails }: StatisticsProps) {
  const summary = generateParticipantSummary(participants);
  const validation = validateParticipants(participants);

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/20 to-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl lg:shadow-2xl border sm:border-2 border-blue-200 sm:border-blue-300 p-3 sm:p-4 lg:p-6 backdrop-blur-sm">
      <div className="text-center mb-3 sm:mb-4 lg:mb-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-800 mb-2 sm:mb-3 drop-shadow-sm">
          📊 إحصائيات السحب
        </h2>
        <div className="w-8 sm:w-12 lg:w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mx-auto shadow-sm"></div>
      </div>

      {/* Participant Statistics */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 text-center border-2 border-green-200"
          >
            <div className="text-2xl font-bold text-green-700">{summary.total}</div>
            <div className="text-sm text-green-600">إجمالي المشاركين</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 text-center border-2 border-blue-200"
          >
            <div className="text-2xl font-bold text-blue-700">{summary.validContacts}</div>
            <div className="text-sm text-blue-600">لديهم وسائل تواصل</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 text-center border-2 border-purple-200">
            <div className="text-xl font-bold text-purple-700">{summary.withPhone}</div>
            <div className="text-sm text-purple-600">📱 رقم هاتف</div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 text-center border-2 border-orange-200">
            <div className="text-xl font-bold text-orange-700">{summary.withEmail}</div>
            <div className="text-sm text-orange-600">📧 بريد إلكتروني</div>
          </div>
        </div>
      </div>

      {/* Validation Status */}
      {validation.errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4"
        >
          <h4 className="font-bold text-red-700 mb-2">⚠️ مشاكل في البيانات:</h4>
          <ul className="text-sm text-red-600 space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {validation.warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4"
        >
          <h4 className="font-bold text-yellow-700 mb-2">⚠️ تحذيرات:</h4>
          <ul className="text-sm text-yellow-600 space-y-1">
            {validation.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Draw Details */}
      {drawDetails && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4"
        >
          <h4 className="font-bold text-green-700 mb-3 text-center">🔍 تفاصيل السحب الشفاف</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">رقم البذرة:</span>
              <span className="font-mono text-green-700 bg-green-100 px-2 py-1 rounded">
                {drawDetails.seed}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">رقم الفائز:</span>
              <span className="font-bold text-green-700">
                #{drawDetails.winnerIndex + 1} من {drawDetails.totalParticipants}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">وقت السحب:</span>
              <span className="font-mono text-green-600 text-xs">
                {new Date(drawDetails.timestamp).toLocaleString('ar-SA')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">احتمالية الفوز:</span>
              <span className="font-bold text-green-700">
                {(100 / drawDetails.totalParticipants).toFixed(2)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Status Indicator */}
      <div className="mt-4 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          validation.isValid
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            validation.isValid ? 'bg-green-500' : 'bg-red-500'
          }`} />
          {validation.isValid ? 'جاهز للسحب' : 'غير جاهز للسحب'}
        </div>
      </div>
    </div>
  );
}
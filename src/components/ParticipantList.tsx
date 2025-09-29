'use client';

import { Participant } from '@/lib/csvParser';

interface ParticipantListProps {
  participants: Participant[];
  isDrawing: boolean;
}

export default function ParticipantList({ participants, isDrawing }: ParticipantListProps) {
  return (
    <div className="bg-gradient-to-br from-white via-green-50/20 to-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl lg:shadow-2xl border sm:border-2 border-green-200 sm:border-green-300 p-3 sm:p-4 lg:p-5 backdrop-blur-sm">
      <div className="text-center mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-green-800 mb-2 sm:mb-3 drop-shadow-sm">
          📋 قائمة المشاركين ({participants.length})
        </h2>
        <div className="w-8 sm:w-10 lg:w-12 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full mx-auto shadow-sm"></div>
      </div>

      <div className="max-h-48 sm:max-h-64 lg:max-h-72 overflow-y-auto">
        <div className="grid gap-3">
          {participants.map((participant, index) => (
            <div
              key={participant.id}
              className={`p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl border sm:border-2 transition-all duration-300 ${
                isDrawing
                  ? 'bg-gray-50/70 border-gray-300 shadow-sm'
                  : 'bg-gradient-to-r from-green-50/80 via-white to-green-50/80 border-green-200 hover:from-green-100 hover:to-green-50 hover:shadow-md sm:hover:shadow-lg hover:border-green-400 hover:scale-101 sm:hover:scale-102'
              }`}
            >
              <div className="text-right">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                  <div className="flex-1 mr-3">
                    <h4 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg">
                      {participant.name}
                    </h4>
                  </div>
                </div>

                {/* Additional participant info */}
                <div className="space-y-1 text-sm">
                  {participant.phone && (
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-mono text-gray-600">{participant.phone}</span>
                      <span className="text-green-600">📱</span>
                    </div>
                  )}
                  {participant.email && (
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-mono text-gray-500 text-xs">
                        {participant.email.length > 30
                          ? `${participant.email.substring(0, 30)}...`
                          : participant.email
                        }
                      </span>
                      <span className="text-green-600">📧</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {participants.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>لا توجد مشاركين</p>
        </div>
      )}

      {participants.length === 1 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4 text-right">
          <p className="text-yellow-700">
            ⚠️ يحتاج السحب إلى مشاركين اثنين على الأقل
          </p>
        </div>
      )}
    </div>
  );
}
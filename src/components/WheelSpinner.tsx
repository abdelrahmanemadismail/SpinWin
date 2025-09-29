'use client';

import { motion } from 'framer-motion';
import { Participant } from '@/lib/csvParser';

interface WheelSpinnerProps {
  participants: Participant[];
  isSpinning: boolean;
  winner?: Participant | null;
}

export default function WheelSpinner({ participants, isSpinning, winner }: WheelSpinnerProps) {
  const participantCount = participants.length;
  const segmentAngle = 360 / participantCount;

  // Create wheel segments
  const wheelSegments = participants.map((participant, index) => {
    const angle = index * segmentAngle;
    const nextAngle = (index + 1) * segmentAngle;

    // Calculate path for each segment
    const radius = 150;
    const centerX = 160;
    const centerY = 160;

    const x1 = centerX + radius * Math.cos((angle * Math.PI) / 180);
    const y1 = centerY + radius * Math.sin((angle * Math.PI) / 180);
    const x2 = centerX + radius * Math.cos((nextAngle * Math.PI) / 180);
    const y2 = centerY + radius * Math.sin((nextAngle * Math.PI) / 180);

    const largeArcFlag = segmentAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    // Text position
    const textAngle = angle + segmentAngle / 2;
    const textRadius = radius * 0.7;
    const textX = centerX + textRadius * Math.cos((textAngle * Math.PI) / 180);
    const textY = centerY + textRadius * Math.sin((textAngle * Math.PI) / 180);

    const isWinner = winner && participant.id === winner.id;

    return (
      <g key={participant.id}>
        <path
          d={pathData}
          fill={isWinner ? '#16a34a' : index % 2 === 0 ? '#dcfce7' : '#bbf7d0'}
          stroke="#16a34a"
          strokeWidth="2"
          className={isWinner ? 'drop-shadow-lg' : ''}
        />
        <text
          x={textX}
          y={textY}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`fill-green-800 text-xs font-medium ${
            isWinner ? 'font-bold text-sm' : ''
          }`}
          transform={`rotate(${textAngle + 90} ${textX} ${textY})`}
        >
          {participant.name.length > 15
            ? participant.name.substring(0, 15) + '...'
            : participant.name
          }
        </text>
      </g>
    );
  });

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        {/* Wheel Container */}
        <motion.div
          animate={isSpinning ? { rotate: 360 * 5 } : {}}
          transition={{
            duration: 3,
            ease: "easeOut"
          }}
          className="relative"
        >
          <svg width="320" height="320" className="drop-shadow-lg">
            {/* Wheel segments */}
            {wheelSegments}

            {/* Center circle */}
            <circle
              cx="160"
              cy="160"
              r="20"
              fill="#16a34a"
              stroke="#15803d"
              strokeWidth="3"
            />

            {/* Center text */}
            <text
              x="160"
              y="160"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white text-sm font-bold"
            >
              سحب
            </text>
          </svg>
        </motion.div>

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <svg width="24" height="32" viewBox="0 0 24 32">
            <path
              d="M12 0 L20 16 L12 12 L4 16 Z"
              fill="#dc2626"
              stroke="#b91c1c"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        {isSpinning ? (
          <motion.p
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-lg font-bold text-green-700"
          >
            جاري السحب...
          </motion.p>
        ) : winner ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="space-y-2"
          >
            <p className="text-sm text-gray-600">الفائز:</p>
            <p className="text-2xl font-bold text-green-700">{winner.name}</p>
          </motion.div>
        ) : (
          <p className="text-gray-500">اضغط &ldquo;ابدأ السحب&rdquo; للبدء</p>
        )}
      </div>
    </div>
  );
}
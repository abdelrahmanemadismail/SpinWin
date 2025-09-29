'use client';

import dynamic from 'next/dynamic';
import { Participant } from '@/lib/csvParser';

interface RotatingListProps {
  participants: Participant[];
  isSpinning: boolean;
  winner?: Participant | null;
  onSpinComplete?: () => void;
}

// Dynamic import with no SSR to ensure client-only rendering
const RotatingListClient = dynamic(
  () => import('./RotatingList'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center h-full flex items-center justify-center">
        <div className="text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-green-500/20 border-t-green-500 rounded-full mx-auto mb-4"></div>
          <p>تحميل منطقة السحب...</p>
        </div>
      </div>
    )
  }
);

export default function RotatingListWrapper(props: RotatingListProps) {
  return <RotatingListClient {...props} />;
}
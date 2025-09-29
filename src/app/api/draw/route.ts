import { NextRequest, NextResponse } from 'next/server';
import { parseParticipantsFromCSV, selectWinner } from '@/lib/csvParser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seed } = body;

    // Get participants from CSV
    const participants = parseParticipantsFromCSV();

    if (participants.length < 2) {
      return NextResponse.json(
        { error: 'يجب أن يكون هناك مشاركان على الأقل للسحب' },
        { status: 400 }
      );
    }

    // Select winner deterministically
    const result = selectWinner(participants, seed);

    return NextResponse.json({
      success: true,
      ...result,
      totalParticipants: participants.length
    });

  } catch (error) {
    console.error('Draw API error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء السحب' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const participants = parseParticipantsFromCSV();

    return NextResponse.json({
      participants,
      count: participants.length
    });

  } catch (error) {
    console.error('Get participants error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل المشاركين' },
      { status: 500 }
    );
  }
}
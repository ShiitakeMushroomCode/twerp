import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
  return new Response(JSON.stringify({ message: 'Error inserting data' }), { status: 500 });
}

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    // 응답을 반환
    return new Response(JSON.stringify({ message: 'Data inserted successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error inserting data', error }), { status: 500 });
  }
}

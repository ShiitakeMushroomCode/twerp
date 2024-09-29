import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await executeQuery('SELECT * from table');
    return NextResponse.json({
      data,
    });
  } catch (err: any) {
    throw err;
  }
}

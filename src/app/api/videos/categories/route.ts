import { NextResponse } from 'next/server';
import { VIDEO_CATEGORIES } from '@/lib/constants';

export async function GET() {
  return NextResponse.json({ categories: VIDEO_CATEGORIES });
}

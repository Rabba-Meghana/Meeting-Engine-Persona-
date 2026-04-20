import { NextResponse } from 'next/server'
import { MEETINGS, PEOPLE } from '@/lib/mockData'

export async function GET() {
  return NextResponse.json({ meetings: MEETINGS, people: PEOPLE })
}

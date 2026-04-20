import { NextResponse } from 'next/server'
import { MEETINGS, PEOPLE } from '@/lib/mockData'

export async function GET() {
  const peopleWithCounts = PEOPLE.map(person => ({
    ...person,
    meetingCount: MEETINGS.filter(m => m.participants.includes(person.name)).length,
  }))
  return NextResponse.json({ meetings: MEETINGS, people: peopleWithCounts })
}

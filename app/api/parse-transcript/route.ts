import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { transcript, personName } = await req.json()
    if (!transcript || !personName) {
      return NextResponse.json({ error: 'Missing transcript or personName' }, { status: 400 })
    }

    const lines = transcript.split('\n').map((l: string) => l.trim()).filter(Boolean)
    const parsed: { speaker: string; text: string; timestamp: number }[] = []
    let timestamp = 0

    for (const line of lines) {
      const patterns = [
        /^\[?\d{1,2}:\d{2}(?::\d{2})?\]?\s*([^:]+?):\s*(.+)$/,
        /^([^:()[\]]+?)(?:\s*\(\d{1,2}:\d{2}\))?:\s*(.+)$/,
      ]
      let matched = false
      for (const pattern of patterns) {
        const m = line.match(pattern)
        if (m) {
          parsed.push({ speaker: m[1].trim(), text: m[2].trim(), timestamp })
          timestamp += 15
          matched = true
          break
        }
      }
      if (!matched && parsed.length > 0) {
        parsed[parsed.length - 1].text += ' ' + line
      }
    }

    if (parsed.length === 0) {
      return NextResponse.json({ error: 'Could not parse. Use format: "Speaker Name: their words"' }, { status: 400 })
    }

    const speakers = [...new Set(parsed.map(p => p.speaker))]
    const matchedSpeaker = speakers.find(s =>
      s.toLowerCase().includes(personName.toLowerCase()) ||
      personName.toLowerCase().includes(s.toLowerCase())
    )

    return NextResponse.json({ parsed, speakers, matchedSpeaker: matchedSpeaker || null, lineCount: parsed.length })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to parse' }, { status: 500 })
  }
}

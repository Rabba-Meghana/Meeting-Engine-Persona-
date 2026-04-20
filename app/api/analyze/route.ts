import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { MEETINGS } from '@/lib/mockData'

function getGroq() { return new Groq({ apiKey: process.env.GROQ_API_KEY || "" }) }

export async function POST(req: NextRequest) {
  const { personName, mode, proposal } = await req.json()

  // Collect all utterances by this person across all meetings
  const utterances: string[] = []
  const context: string[] = []

  for (const meeting of MEETINGS) {
    const personLines = meeting.transcript.filter(t => t.speaker === personName)
    const otherLines = meeting.transcript.filter(t => t.speaker !== personName)

    if (personLines.length > 0) {
      utterances.push(...personLines.map(t => `[${meeting.title}] ${t.text}`))
      context.push(
        `Meeting: ${meeting.title} (${meeting.date})\n` +
        meeting.transcript.map(t => `${t.speaker}: ${t.text}`).join('\n')
      )
    }
  }

  if (utterances.length === 0) {
    return NextResponse.json({ error: 'No data for this person' }, { status: 404 })
  }

  const allUtterances = utterances.join('\n\n')
  const allContext = context.join('\n\n---\n\n')

  if (mode === 'profile') {
    const prompt = `You are a behavioral analyst. Analyze how ${personName} communicates across these meeting transcripts and generate a deep behavioral DNA profile.

TRANSCRIPTS:
${allContext}

${personName}'s specific utterances:
${allUtterances}

Generate a JSON response with exactly this structure (no markdown, raw JSON only):
{
  "communicationStyle": {
    "label": "2-3 word label for their style",
    "description": "2 sentences describing how they communicate"
  },
  "decisionPattern": {
    "label": "how they make decisions",
    "description": "2 sentences"
  },
  "stressResponse": {
    "label": "how they behave under pressure",
    "description": "2 sentences"
  },
  "influenceMethod": {
    "label": "how they drive outcomes",
    "description": "2 sentences"
  },
  "radarScores": {
    "directness": 0-100,
    "empathy": 0-100,
    "urgency": 0-100,
    "strategicThinking": 0-100,
    "riskTolerance": 0-100,
    "collaboration": 0-100
  },
  "talkTimePercent": 0-100,
  "interruptionTendency": "rarely|sometimes|often",
  "questionFrequency": "low|medium|high",
  "keyPhrases": ["phrase1", "phrase2", "phrase3", "phrase4"],
  "blindSpots": "1-2 sentences about their weaknesses or gaps",
  "workingWithTip": "1-2 sentences on how to work effectively with them",
  "avoidWith": "1 sentence on what to never do with them",
  "influenceMap": [
    { "person": "name", "influence": 0-100, "direction": "gives|receives|mutual" }
  ]
}`

    const response = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const text = response.choices[0].message.content || ''
    const clean = text.replace(/```json|```/g, '').trim()

    try {
      const parsed = JSON.parse(clean)
      return NextResponse.json({ profile: parsed })
    } catch {
      return NextResponse.json({ error: 'Parse error', raw: text }, { status: 500 })
    }
  }

  if (mode === 'predict') {
    const prompt = `You are a behavioral analyst who has studied ${personName} across multiple meetings.

${personName}'s communication patterns:
${allUtterances}

Someone is about to share this proposal with ${personName}:
"${proposal}"

Predict their response. Return raw JSON only, no markdown:
{
  "initialReaction": "enthusiastic|skeptical|neutral|cautious",
  "reactionReason": "1 sentence explaining why",
  "likelyFirstQuestion": "the exact question they'll probably ask first",
  "potentialObjection": "their most likely objection, or null if none",
  "howToFrameIt": "how to present this proposal to maximize buy-in",
  "probability": { "approve": 0-100, "pushback": 0-100, "defer": 0-100 },
  "keyPhrasesToUse": ["phrase that resonates with them", "another phrase"],
  "keyPhrasesToAvoid": ["phrase that will trigger resistance"]
}`

    const response = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    })

    const text = response.choices[0].message.content || ''
    const clean = text.replace(/```json|```/g, '').trim()

    try {
      const parsed = JSON.parse(clean)
      return NextResponse.json({ prediction: parsed })
    } catch {
      return NextResponse.json({ error: 'Parse error', raw: text }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
}

import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { buildBehaviorProfile, buildDeterministicPrediction } from '@/lib/behavior'

function getGroq() {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null
  return new Groq({ apiKey })
}

function extractJson(text: string) {
  const clean = text.replace(/```json|```/g, '').trim()
  try { return JSON.parse(clean) } catch {
    const a = clean.indexOf('{')
    const b = clean.lastIndexOf('}')
    if (a !== -1 && b > a) return JSON.parse(clean.slice(a, b + 1))
    throw new Error('Model did not return valid JSON')
  }
}

function buildFallbackProfile(profile: NonNullable<ReturnType<typeof buildBehaviorProfile>>) {
  const r = profile.radarScores
  const n = profile.personName
  return {
    communicationStyle: {
      label: r.directness > 70 ? 'Direct and decisive' : r.empathy > 70 ? 'Empathetic and collaborative' : 'Measured and analytical',
      description: r.directness > 70
        ? `${n} communicates with clarity and brevity, cutting quickly to what matters. They push for concrete tradeoffs over exploratory discussion.`
        : r.empathy > 70
        ? `${n} communicates with warmth and attention to how decisions affect people. They build consensus before committing.`
        : `${n} brings precision to conversations, asking sharp questions and anchoring discussion in evidence.`,
    },
    decisionPattern: {
      label: r.strategicThinking > 70 ? 'Evidence-driven strategist' : r.urgency > 68 ? 'Action-oriented executor' : 'Pragmatic and grounded',
      description: r.strategicThinking > 70
        ? `Decisions are anchored in data, tradeoffs, and longer-horizon thinking. They connect near-term choices to strategic outcomes.`
        : r.urgency > 68
        ? `They prefer to decide fast and adjust rather than wait for perfect information. Speed and momentum matter to them.`
        : `They weigh operational reality carefully and prefer decisions that can be executed cleanly over theoretically optimal ones.`,
    },
    stressResponse: {
      label: r.directness > 68 ? 'Focused and sharper' : r.collaboration > 68 ? 'Steadying presence' : 'Methodical and deliberate',
      description: r.directness > 68
        ? `Under pressure, they narrow focus and become more direct. Expect shorter turns, harder questions, and a faster decision forcing function.`
        : `Under pressure they work to stabilize the room, gather information, and ensure the team has what it needs before acting.`,
    },
    influenceMethod: {
      label: r.directness > 68 ? 'Sets the decision frame' : r.empathy > 68 ? 'Builds trust and alignment' : 'Shapes thinking through evidence',
      description: r.directness > 68
        ? `They influence by defining what the question actually is and what standard a good answer must meet. Others respond to the frame they set.`
        : r.empathy > 68
        ? `They influence through genuine investment in people and outcomes. Trust is their primary currency in the room.`
        : `They shape decisions by surfacing data and precedent that reframe the options available. Evidence is their primary tool.`,
    },
    radarScores: r,
    talkTimePercent: profile.talkTimePercent,
    interruptionTendency: profile.interruptionTendency,
    questionFrequency: profile.questionFrequency,
    keyPhrases: profile.keyPhrases,
    blindSpots: profile.blindSpotSeed,
    workingWithTip: profile.workingWithTipSeed,
    avoidWith: profile.avoidWithSeed,
    influenceMap: profile.influenceMap,
  }
}

async function narrateProfile(profile: NonNullable<ReturnType<typeof buildBehaviorProfile>>) {
  const groq = getGroq()
  if (!groq) return buildFallbackProfile(profile)

  const prompt = `You are writing a behavioral profile from measured transcript data. Write specific, distinct language — avoid generic startup prose. Each person should sound different.

PERSON: ${profile.personName}
MEASURED SCORES: ${JSON.stringify(profile.radarScores)}
EVIDENCE: ${JSON.stringify(profile.evidence)}
talkTimePercent=${profile.talkTimePercent}, interruptionTendency=${profile.interruptionTendency}, questionFrequency=${profile.questionFrequency}
SAMPLE PHRASES: ${JSON.stringify(profile.keyPhrases)}
workingWithTip: ${profile.workingWithTipSeed}
blindSpot: ${profile.blindSpotSeed}
avoidWith: ${profile.avoidWithSeed}

Write raw JSON only (no markdown) with this exact shape:
{"communicationStyle":{"label":"string","description":"string"},"decisionPattern":{"label":"string","description":"string"},"stressResponse":{"label":"string","description":"string"},"influenceMethod":{"label":"string","description":"string"},"radarScores":{},"talkTimePercent":0,"interruptionTendency":"rarely","questionFrequency":"low","keyPhrases":[],"blindSpots":"string","workingWithTip":"string","avoidWith":"string","influenceMap":[]}`

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.35,
      max_tokens: 700,
    })
    const text = response.choices?.[0]?.message?.content || ''
    const parsed = extractJson(text)
    // Always use measured values — never let model override
    parsed.radarScores = profile.radarScores
    parsed.talkTimePercent = profile.talkTimePercent
    parsed.interruptionTendency = profile.interruptionTendency
    parsed.questionFrequency = profile.questionFrequency
    parsed.keyPhrases = profile.keyPhrases
    parsed.influenceMap = profile.influenceMap
    return parsed
  } catch {
    return buildFallbackProfile(profile)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { personName, mode, proposal = '' } = body

    if (!personName || !mode) {
      return NextResponse.json({ error: 'Missing personName or mode' }, { status: 400 })
    }

    const profile = buildBehaviorProfile(personName)
    if (!profile) {
      return NextResponse.json({ error: 'No transcript data found for this person' }, { status: 404 })
    }

    if (mode === 'profile') {
      const narrated = await narrateProfile(profile)
      return NextResponse.json({ profile: narrated })
    }

    if (mode === 'predict') {
      // Deterministic first — no LLM override of behavior
      const prediction = buildDeterministicPrediction(profile, proposal)
      return NextResponse.json({ prediction })
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown server error' },
      { status: 500 }
    )
  }
}

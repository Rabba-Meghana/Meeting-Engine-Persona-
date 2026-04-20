import { MEETINGS } from '@/lib/mockData'

type TranscriptLine = { speaker: string; text: string; timestamp: number }
type Meeting = { id: string; title: string; date: string; duration: number; participants: string[]; transcript: TranscriptLine[] }

export type RadarScores = {
  directness: number
  empathy: number
  urgency: number
  strategicThinking: number
  riskTolerance: number
  collaboration: number
}

export type InfluenceEdge = {
  person: string
  influence: number
  direction: 'gives' | 'receives' | 'mutual'
}

export type BehaviorProfile = {
  personName: string
  utterances: string[]
  meetingCount: number
  talkTimePercent: number
  interruptionTendency: 'rarely' | 'sometimes' | 'often'
  questionFrequency: 'low' | 'medium' | 'high'
  keyPhrases: string[]
  radarScores: RadarScores
  evidence: Record<string, number>
  influenceMap: InfluenceEdge[]
  workingWithTipSeed: string
  blindSpotSeed: string
  avoidWithSeed: string
}

const meetings = MEETINGS as Meeting[]

const ACTION_WORDS = ['ship', 'launch', 'build', 'deliver', 'execute', 'move', 'prioritize', 'focus', 'patch', 'fix', 'improve', 'validate', 'do', 'done', 'send', 'commit']
const HEDGE_WORDS = ['maybe', 'perhaps', 'might', 'could', 'possibly', 'sort of', 'kind of', 'i think', 'probably', 'i guess', 'not sure']
const CERTAINTY_WORDS = ['will', 'need', 'must', 'definitely', 'clearly', 'exactly', 'should', "isn't negotiable", 'done', 'agreed', 'disqualifying']
const EMPATHY_WORDS = ['frustrated', 'concern', 'support', 'help', 'candidate', 'customer', 'experience', 'people', 'respect', 'trust', 'feel', 'retention', 'person']
const COLLAB_WORDS = ['we', 'together', 'align', 'let\'s', 'team', 'sync', 'share', 'partnership', 'ownership', 'consensus']
const TECH_WORDS = ['api', 'latency', 'edge case', 'reconnect', 'infra', 'system', 'architecture', 'webhook', 'bug', 'patch', 'scope', 'regression', 'buffer', 'auth', 'workaround', 'refactor']
const STRATEGIC_WORDS = ['roadmap', 'priority', 'tradeoff', 'market', 'investor', 'customer impact', 'business', 'defensibility', 'timeline', 'q3', 'q4', 'moat', 'narrative', 'structural', 'pipeline', 'process']
const RISK_WORDS = ['risk', 'safe', 'failure', 'downside', 'concern', 'blocker', 'issue', 'edge case', 'deprioritized', 'cut corners', 'lose', 'losing', 'band-aid']
const QUESTION_WORDS = ['what', 'how', 'when', 'why', 'where', 'is the', 'are we', 'can we', 'do we', 'should we']
const DATA_WORDS = ['data', 'tracked', 'measured', 'percent', 'number', 'rate', 'days', 'months', 'average', 'estimate', '%', 'million', '40%', '34 days', 'acceptance rate']
const PEOPLE_WORDS = ['candidate', 'team', 'culture', 'onboarding', 'people', 'hiring', 'growth', 'experience', 'retention', 'respect']

function clamp(n: number, min = 0, max = 100) { return Math.max(min, Math.min(max, Math.round(n))) }

function countMatches(text: string, terms: string[]) {
  const lower = text.toLowerCase()
  return terms.reduce((c, t) => c + (lower.includes(t) ? 1 : 0), 0)
}

function topPhrases(utterances: string[], limit = 5): string[] {
  const candidates = utterances
    .flatMap(u => u.split(/[.!?]/))
    .map(s => s.trim())
    .filter(s => s.length >= 12 && s.length <= 80)
  const uniq: string[] = []
  for (const c of candidates) {
    if (!uniq.some(u => u.toLowerCase() === c.toLowerCase())) uniq.push(c)
    if (uniq.length >= limit) break
  }
  return uniq
}

function norm(count: number, total: number) { return total ? count / total : 0 }

export function buildBehaviorProfile(personName: string): BehaviorProfile | null {
  const personMeetings = meetings.filter(m => m.transcript.some(t => t.speaker === personName))
  if (!personMeetings.length) return null

  const utterances: string[] = []
  const speakerWordTotals = new Map<string, number>()
  let totalWordsAll = 0
  let totalInterruptionsObserved = 0
  let personInterruptions = 0

  for (const meeting of personMeetings) {
    let prevSpeaker = ''
    let prevTimestamp = -999

    for (const line of meeting.transcript) {
      const words = line.text.trim().split(/\s+/).filter(Boolean).length
      totalWordsAll += words
      speakerWordTotals.set(line.speaker, (speakerWordTotals.get(line.speaker) || 0) + words)
      if (line.speaker === personName) utterances.push(line.text)

      if (prevSpeaker && line.speaker !== prevSpeaker &&
          typeof line.timestamp === 'number' && line.timestamp - prevTimestamp <= 5) {
        totalInterruptionsObserved++
        if (line.speaker === personName) personInterruptions++
      }
      prevSpeaker = line.speaker
      prevTimestamp = line.timestamp
    }
  }

  const joined = utterances.join(' ').toLowerCase()
  const totalU = utterances.length
  const totalWords = utterances.reduce((s, u) => s + u.split(/\s+/).filter(Boolean).length, 0)
  const avgWords = totalU ? totalWords / totalU : 0

  const questionCount = utterances.filter(u => u.includes('?')).length
  const actionCount = countMatches(joined, ACTION_WORDS)
  const hedgeCount = countMatches(joined, HEDGE_WORDS)
  const certaintyCount = countMatches(joined, CERTAINTY_WORDS)
  const empathyCount = countMatches(joined, EMPATHY_WORDS)
  const collaborationCount = countMatches(joined, COLLAB_WORDS)
  const technicalCount = countMatches(joined, TECH_WORDS)
  const strategicCount = countMatches(joined, STRATEGIC_WORDS)
  const riskCount = countMatches(joined, RISK_WORDS)
  const dataCount = countMatches(joined, DATA_WORDS)
  const peopleCount = countMatches(joined, PEOPLE_WORDS)

  const questionRate = norm(questionCount, Math.max(totalU, 1))
  const actionRate = norm(actionCount, Math.max(totalU, 1))
  const hedgeRate = norm(hedgeCount, Math.max(totalU, 1))
  const certaintyRate = norm(certaintyCount, Math.max(totalU, 1))
  const empathyRate = norm(empathyCount, Math.max(totalU, 1))
  const collaborationRate = norm(collaborationCount, Math.max(totalU, 1))
  const technicalRate = norm(technicalCount, Math.max(totalU, 1))
  const strategicRate = norm(strategicCount, Math.max(totalU, 1))
  const riskRate = norm(riskCount, Math.max(totalU, 1))
  const dataRate = norm(dataCount, Math.max(totalU, 1))
  const peopleRate = norm(peopleCount, Math.max(totalU, 1))
  const interruptionRate = norm(personInterruptions, Math.max(totalInterruptionsObserved, 1))

  const talkWords = speakerWordTotals.get(personName) || 0
  const talkTimePercent = clamp((talkWords / Math.max(totalWordsAll, 1)) * 100, 5, 90)

  const directness = clamp(45 + certaintyRate * 40 + actionRate * 20 + (avgWords < 14 ? 10 : 0) - hedgeRate * 25)
  const empathy = clamp(30 + empathyRate * 40 + collaborationRate * 15 + peopleRate * 20 + questionRate * 8)
  const urgency = clamp(38 + actionRate * 40 + certaintyRate * 18 + (avgWords < 12 ? 10 : 0) - hedgeRate * 10)
  const strategicThinking = clamp(38 + strategicRate * 40 + dataRate * 20 + technicalRate * 10 + riskRate * 8)
  const riskTolerance = clamp(55 + actionRate * 12 - riskRate * 28 - hedgeRate * 10 + certaintyRate * 5)
  const collaboration = clamp(32 + collaborationRate * 40 + empathyRate * 18 + questionRate * 12 - interruptionRate * 15)

  const questionFrequency = questionRate >= 0.5 ? 'high' : questionRate >= 0.2 ? 'medium' : 'low'
  const interruptionTendency = interruptionRate >= 0.5 ? 'often' : interruptionRate >= 0.2 ? 'sometimes' : 'rarely'

  const others = [...new Set(personMeetings.flatMap(m => m.participants))].filter(p => p !== personName)

  const influenceMap: InfluenceEdge[] = others.slice(0, 3).map(other => {
    const score = clamp(45 + (directness - 50) * 0.2 + (strategicThinking - 50) * 0.15 + (collaboration - 50) * 0.1)
    const direction: 'gives' | 'receives' | 'mutual' =
      directness > 68 && strategicThinking > 62 ? 'gives' :
      collaboration > 70 && directness < 55 ? 'receives' : 'mutual'
    return { person: other, influence: score, direction }
  })

  const workingWithTipSeed =
    directness > 72 ? 'Bring a concrete recommendation with explicit tradeoffs. They respond to specifics, not possibilities.' :
    empathy > 68 ? 'Include the human dimension in your pitch. They care about people impact as much as metrics.' :
    collaboration > 68 ? 'Engage them early in the process. They shape better outcomes when involved from the start.' :
    'Be grounded in evidence and come with a clear point of view on the tradeoffs.'

  const blindSpotSeed =
    urgency > 68 ? 'Can move quickly and underweight the social alignment or downstream change management required.' :
    strategicThinking > 72 ? 'May over-index on complexity and tradeoffs before the room is fully aligned.' :
    empathy > 72 ? 'May prioritize consensus over speed when a faster, bolder decision is warranted.' :
    'May need clearer signals before fully committing their position.'

  const avoidWithSeed =
    directness > 68 ? 'Never bring vague updates without a point of view or recommendation.' :
    empathy > 70 ? 'Never dismiss the people or experience dimension of a decision as irrelevant.' :
    'Never force premature certainty or skip the evidence entirely.'

  return {
    personName,
    utterances,
    meetingCount: personMeetings.length,
    talkTimePercent,
    interruptionTendency,
    questionFrequency,
    keyPhrases: topPhrases(utterances),
    radarScores: { directness, empathy, urgency, strategicThinking, riskTolerance, collaboration },
    evidence: {
      avgWordsPerTurn: +avgWords.toFixed(2),
      questionRate: +questionRate.toFixed(2),
      actionRate: +actionRate.toFixed(2),
      hedgeRate: +hedgeRate.toFixed(2),
      certaintyRate: +certaintyRate.toFixed(2),
      empathyRate: +empathyRate.toFixed(2),
      collaborationRate: +collaborationRate.toFixed(2),
      technicalRate: +technicalRate.toFixed(2),
      strategicRate: +strategicRate.toFixed(2),
      riskRate: +riskRate.toFixed(2),
      dataRate: +dataRate.toFixed(2),
      peopleRate: +peopleRate.toFixed(2),
      interruptionRate: +interruptionRate.toFixed(2),
    },
    influenceMap,
    workingWithTipSeed,
    blindSpotSeed,
    avoidWithSeed,
  }
}

export function buildDeterministicPrediction(profile: BehaviorProfile, proposal: string) {
  const lower = proposal.toLowerCase()

  const risky = /risk|delay|refactor|migration|rewrite|uncertain|experiment|slow|remove|cut|skip|reduce/.test(lower)
  const commercial = /customer|revenue|enterprise|adoption|sales|market|deal|close|pipeline/.test(lower)
  const technical = /api|infra|latency|architecture|system|bug|webhook|patch|code|engineering/.test(lower)
  const people = /hire|candidate|onboard|culture|team|process|interview|retention|growth/.test(lower)
  const speed = /faster|speed|quick|accelerate|compress|cut time|reduce time/.test(lower)

  const r = profile.radarScores

  let approve = 50
  let pushback = 25
  let defer = 25

  approve += (r.collaboration - 50) * 0.12
  approve += commercial ? 10 : 0
  approve += speed && r.urgency > 65 ? 8 : 0
  approve += people && r.empathy > 65 ? 10 : 0

  pushback += risky ? 18 : 0
  pushback += (70 - r.riskTolerance) * 0.2
  pushback += r.directness > 70 ? 6 : 0
  pushback += people && r.empathy > 70 ? -8 : 0

  defer += risky && r.strategicThinking > 70 ? 6 : 0
  defer += commercial ? -4 : 0

  approve = Math.max(5, Math.round(approve))
  pushback = Math.max(5, Math.round(pushback))
  defer = Math.max(5, Math.round(defer))

  const total = approve + pushback + defer
  approve = Math.round((approve / total) * 100)
  pushback = Math.round((pushback / total) * 100)
  defer = 100 - approve - pushback

  const initialReaction =
    approve >= 55 ? 'interested but probing' :
    pushback >= 45 ? 'skeptical' : 'cautious'

  const likelyFirstQuestion =
    people && r.empathy > 65 ? "What's the candidate or team experience impact, and how will we measure it?" :
    risky && r.riskTolerance < 55 ? "What's the downside scenario and how do we contain execution risk?" :
    commercial ? "What's the concrete customer or business upside, and how quickly will we validate it?" :
    technical ? "What's the implementation scope and what breaks if we do this now?" :
    "What's the specific upside, and what tradeoff are we accepting to get it?"

  const potentialObjection =
    risky ? "The proposal introduces risk or complexity without a tight enough mitigation plan." :
    r.urgency > 65 && !speed ? "This timeline isn't moving fast enough relative to the opportunity." :
    people && r.empathy > 70 ? "The people or experience dimension of this change needs more thought." :
    "The success metric needs to be sharper before we commit."

  const howToFrameIt =
    people && r.empathy > 65 ? "Lead with the human impact and the measurable experience improvement. Include a timeline and a way to track success." :
    commercial ? "Lead with customer impact and the smallest credible path to measurable value." :
    technical ? "Lead with implementation scope, risk containment, and why this is the highest leverage move now." :
    "Lead with the tradeoff, expected outcome, and a concrete validation plan."

  const keyPhrasesToUse =
    people && r.empathy > 65 ? ['candidate experience', 'trust', 'measurable impact'] :
    commercial ? ['customer impact', 'concrete tradeoff', 'revenue signal'] :
    ['execution risk', 'concrete tradeoff', 'clear success metric']

  const keyPhrasesToAvoid =
    r.directness > 65 ? ["we will figure it out", "this is probably fine", "no clear plan yet"] :
    r.empathy > 68 ? ['just a process change', "people will adapt", 'efficiency first'] :
    ["we'll figure it out later", 'this should be fine']

  return {
    initialReaction,
    reactionReason: `${profile.personName} evaluates proposals through the lens of ${r.empathy > 68 ? 'people impact and process quality' : r.strategicThinking > 68 ? 'strategic tradeoffs and execution realism' : 'concrete outcomes and operational risk'}.`,
    likelyFirstQuestion,
    potentialObjection,
    howToFrameIt,
    probability: { approve, pushback, defer },
    keyPhrasesToUse,
    keyPhrasesToAvoid,
  }
}

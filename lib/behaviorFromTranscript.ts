import { buildBehaviorProfile, BehaviorProfile } from '@/lib/behavior'
import { MEETINGS } from '@/lib/mockData'

type Line = { speaker: string; text: string; timestamp: number }

// Build a profile from a custom transcript array (same logic as behavior.ts but takes raw lines)
export function buildProfileFromLines(personName: string, lines: Line[]): BehaviorProfile | null {
  // Inject into a temporary meeting structure and reuse existing engine
  const tempMeeting = {
    id: 'custom',
    title: 'Custom Transcript',
    date: new Date().toISOString().split('T')[0],
    duration: Math.round(lines.length * 0.5),
    participants: [...new Set(lines.map(l => l.speaker))],
    transcript: lines,
  }

  // Temporarily inject — we replicate buildBehaviorProfile logic inline
  // to avoid mutating global MEETINGS
  const ACTION_WORDS = ['ship', 'launch', 'build', 'deliver', 'execute', 'move', 'prioritize', 'focus', 'patch', 'fix', 'improve', 'validate', 'do', 'done', 'send', 'commit']
  const HEDGE_WORDS = ['maybe', 'perhaps', 'might', 'could', 'possibly', 'sort of', 'kind of', 'i think', 'probably', 'i guess', 'not sure']
  const CERTAINTY_WORDS = ['will', 'need', 'must', 'definitely', 'clearly', 'exactly', 'should', 'done', 'agreed']
  const EMPATHY_WORDS = ['frustrated', 'concern', 'support', 'help', 'candidate', 'customer', 'experience', 'people', 'respect', 'trust', 'feel', 'retention', 'person']
  const COLLAB_WORDS = ['we', 'together', 'align', 'team', 'sync', 'share', 'consensus']
  const TECH_WORDS = ['api', 'latency', 'edge case', 'reconnect', 'infra', 'system', 'architecture', 'webhook', 'bug', 'patch', 'scope', 'regression', 'auth', 'refactor']
  const STRATEGIC_WORDS = ['roadmap', 'priority', 'tradeoff', 'market', 'investor', 'customer impact', 'business', 'timeline', 'q3', 'q4', 'moat', 'pipeline', 'process']
  const RISK_WORDS = ['risk', 'safe', 'failure', 'downside', 'concern', 'blocker', 'issue', 'edge case', 'lose', 'losing']
  const DATA_WORDS = ['data', 'tracked', 'measured', 'percent', 'number', 'rate', 'days', 'months', 'average', 'estimate', '%', 'million']
  const PEOPLE_WORDS = ['candidate', 'team', 'culture', 'onboarding', 'people', 'hiring', 'growth', 'experience', 'retention', 'respect']

  function clamp(n: number, min = 0, max = 100) { return Math.max(min, Math.min(max, Math.round(n))) }
  function countMatches(text: string, terms: string[]) {
    const lower = text.toLowerCase()
    return terms.reduce((c, t) => c + (lower.includes(t) ? 1 : 0), 0)
  }
  function norm(count: number, total: number) { return total ? count / total : 0 }
  function topPhrases(utterances: string[], limit = 5): string[] {
    const candidates = utterances.flatMap(u => u.split(/[.!?]/)).map(s => s.trim()).filter(s => s.length >= 12 && s.length <= 80)
    const uniq: string[] = []
    for (const c of candidates) {
      if (!uniq.some(u => u.toLowerCase() === c.toLowerCase())) uniq.push(c)
      if (uniq.length >= limit) break
    }
    return uniq
  }

  const utterances = lines.filter(l => l.speaker === personName).map(l => l.text)
  if (!utterances.length) return null

  const speakerWordTotals = new Map<string, number>()
  let totalWordsAll = 0
  let totalInterruptionsObserved = 0
  let personInterruptions = 0
  let prevSpeaker = ''
  let prevTimestamp = -999

  for (const line of lines) {
    const words = line.text.trim().split(/\s+/).filter(Boolean).length
    totalWordsAll += words
    speakerWordTotals.set(line.speaker, (speakerWordTotals.get(line.speaker) || 0) + words)
    if (prevSpeaker && line.speaker !== prevSpeaker && line.timestamp - prevTimestamp <= 5) {
      totalInterruptionsObserved++
      if (line.speaker === personName) personInterruptions++
    }
    prevSpeaker = line.speaker
    prevTimestamp = line.timestamp
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

  const others = [...new Set(lines.map(l => l.speaker))].filter(s => s !== personName)
  const radarScores = { directness, empathy, urgency, strategicThinking, riskTolerance, collaboration }

  const influenceMap = others.slice(0, 3).map(other => {
    const score = clamp(45 + (directness - 50) * 0.2 + (strategicThinking - 50) * 0.15 + (collaboration - 50) * 0.1)
    const direction: 'gives' | 'receives' | 'mutual' =
      directness > 68 && strategicThinking > 62 ? 'gives' :
      collaboration > 70 && directness < 55 ? 'receives' : 'mutual'
    return { person: other, influence: score, direction }
  })

  return {
    personName,
    utterances,
    meetingCount: 1,
    talkTimePercent,
    interruptionTendency,
    questionFrequency,
    keyPhrases: topPhrases(utterances),
    radarScores,
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
    workingWithTipSeed: directness > 72 ? 'Bring a concrete recommendation with explicit tradeoffs.' : empathy > 68 ? 'Include the human dimension in your pitch.' : 'Be grounded in evidence and come with a clear point of view.',
    blindSpotSeed: urgency > 68 ? 'Can move quickly and underweight social alignment needed.' : empathy > 72 ? 'May prioritize consensus over speed when a bolder decision is needed.' : 'May need clearer signals before fully committing.',
    avoidWithSeed: directness > 68 ? 'Never bring vague updates without a recommendation.' : empathy > 70 ? 'Never dismiss the people dimension of a decision.' : 'Never force premature certainty without evidence.',
  }
}

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from 'recharts'

interface Person {
  name: string
  avatar: string
  role: string
  meetingCount: number
}

interface Profile {
  communicationStyle: { label: string; description: string }
  decisionPattern: { label: string; description: string }
  stressResponse: { label: string; description: string }
  influenceMethod: { label: string; description: string }
  radarScores: Record<string, number>
  talkTimePercent: number
  interruptionTendency: string
  questionFrequency: string
  keyPhrases: string[]
  blindSpots: string
  workingWithTip: string
  avoidWith: string
  influenceMap: { person: string; influence: number; direction: string }[]
}

interface Prediction {
  initialReaction: string
  reactionReason: string
  likelyFirstQuestion: string
  potentialObjection: string | null
  howToFrameIt: string
  probability: { approve: number; pushback: number; defer: number }
  keyPhrasesToUse: string[]
  keyPhrasesToAvoid: string[]
}

interface ParsedLine {
  speaker: string
  text: string
  timestamp: number
}

const REACTION_COLORS: Record<string, string> = {
  enthusiastic: '#7fffd4',
  skeptical: '#f472b6',
  neutral: '#a78bfa',
  cautious: '#fbbf24',
  'interested but probing': '#7fffd4',
}

const avatarColors = ['#7fffd4', '#a78bfa', '#f472b6', '#fbbf24', '#60a5fa']

export default function Home() {
  const [people, setPeople] = useState<Person[]>([])
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPrediction, setLoadingPrediction] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'predict' | 'working'>('profile')
  const [proposal, setProposal] = useState('')
  const [meetings, setMeetings] = useState<{ title: string; date: string; duration: number }[]>([])
  const [showTranscriptModal, setShowTranscriptModal] = useState(false)
  const [transcriptText, setTranscriptText] = useState('')
  const [customPersonName, setCustomPersonName] = useState('')
  const [parsedLines, setParsedLines] = useState<ParsedLine[] | null>(null)
  const [parseError, setParseError] = useState('')
  const [parsedSpeakers, setParsedSpeakers] = useState<string[]>([])
  const [customLines, setCustomLines] = useState<ParsedLine[] | null>(null)
  const [cardVisible, setCardVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/meetings')
      .then(r => r.json())
      .then(d => {
        setPeople(d.people)
        setMeetings(d.meetings)
      })
  }, [])

  const loadProfile = useCallback(async (person: Person, lines?: ParsedLine[]) => {
    setProfile(null)
    setPrediction(null)
    setLoadingProfile(true)
    setActiveTab('profile')
    setCardVisible(false)
    try {
      const raw = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personName: person.name,
          mode: 'profile',
          customLines: lines || null,
        }),
      }).then(r => r.text())
      const d = raw ? JSON.parse(raw) : {}
      if (d.error) throw new Error(d.error)
      setProfile(d.profile)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingProfile(false)
    }
  }, [])

  const selectPerson = (person: Person) => {
    setSelectedPerson(person)
    setCustomLines(null)
    loadProfile(person)
  }

  const runPrediction = async () => {
    if (!selectedPerson || !proposal.trim()) return
    setLoadingPrediction(true)
    setPrediction(null)
    try {
      const raw = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personName: selectedPerson.name,
          mode: 'predict',
          proposal,
          customLines: customLines || null,
        }),
      }).then(r => r.text())
      const d = raw ? JSON.parse(raw) : {}
      if (d.error) throw new Error(d.error)
      setPrediction(d.prediction)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingPrediction(false)
    }
  }

  const parseTranscript = async () => {
    if (!transcriptText.trim() || !customPersonName.trim()) return
    setParseError('')
    try {
      const raw = await fetch('/api/parse-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcriptText, personName: customPersonName }),
      }).then(r => r.text())
      const d = raw ? JSON.parse(raw) : {}
      if (d.error) { setParseError(d.error); return }
      setParsedLines(d.parsed)
      setParsedSpeakers(d.speakers)
    } catch (e) {
      setParseError('Failed to parse transcript')
    }
  }

  const analyzeCustom = () => {
    if (!parsedLines || !customPersonName) return
    const person: Person = {
      name: customPersonName,
      avatar: customPersonName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2),
      role: 'Custom Profile',
      meetingCount: 1,
    }
    setSelectedPerson(person)
    setCustomLines(parsedLines)
    setShowTranscriptModal(false)
    setParsedLines(null)
    setTranscriptText('')
    setParsedSpeakers([])
    loadProfile(person, parsedLines)
  }

  const radarData = profile ? Object.entries(profile.radarScores).map(([key, val]) => ({
    subject: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
    value: val,
  })) : []

  const personIndex = people.findIndex(p => p.name === selectedPerson?.name)
  const avatarColor = avatarColors[personIndex >= 0 ? personIndex % 5 : 0]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Transcript Modal */}
      {showTranscriptModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 28, width: '100%', maxWidth: 640, maxHeight: '85vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700 }}>Paste Your Transcript</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Format: Speaker Name: their words</div>
              </div>
              <button onClick={() => { setShowTranscriptModal(false); setParsedLines(null); setParseError('') }}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 8 }}>PERSON TO ANALYZE</div>
              <input
                value={customPersonName}
                onChange={e => setCustomPersonName(e.target.value)}
                placeholder="e.g. Sarah Chen"
                style={{
                  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--text)', fontFamily: 'DM Mono, monospace',
                  fontSize: 13, padding: '10px 14px', outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 8 }}>TRANSCRIPT</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.6 }}>
                Supports Zoom, Google Meet, Otter.ai exports. Each line should start with the speaker name followed by a colon.
              </div>
              <textarea
                value={transcriptText}
                onChange={e => setTranscriptText(e.target.value)}
                placeholder={`Alex Rivers: We need to decide today whether to prioritize reliability or speed.\nPriya Sharma: If we cut scope now, we risk shipping something that embarrasses us.\nAlex Rivers: I'd rather ship something real and fix it fast than wait for perfect.`}
                style={{
                  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--text)', fontFamily: 'DM Mono, monospace',
                  fontSize: 12, padding: 14, resize: 'vertical', minHeight: 200,
                  outline: 'none', lineHeight: 1.7,
                }}
              />
            </div>

            {parseError && (
              <div style={{ color: '#f472b6', fontSize: 12, marginBottom: 12, padding: '8px 12px', background: 'rgba(244,114,182,0.1)', borderRadius: 8 }}>
                {parseError}
              </div>
            )}

            {parsedLines && (
              <div style={{ marginBottom: 16, padding: 14, background: 'rgba(127,255,212,0.06)', border: '1px solid rgba(127,255,212,0.2)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 8, fontWeight: 500 }}>
                  ✓ Parsed {parsedLines.length} lines · {parsedSpeakers.length} speakers detected
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  Speakers: {parsedSpeakers.join(', ')}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              {!parsedLines ? (
                <button
                  onClick={parseTranscript}
                  disabled={!transcriptText.trim() || !customPersonName.trim()}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  Parse Transcript
                </button>
              ) : (
                <button onClick={analyzeCustom} className="btn-primary" style={{ flex: 1 }}>
                  Generate Profile →
                </button>
              )}
              {parsedLines && (
                <button onClick={() => setParsedLines(null)}
                  style={{ padding: '10px 16px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}>
                  Re-parse
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside style={{
        width: 280, flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '28px 0',
      }}>
        <div style={{ padding: '0 24px 28px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #7fffd4, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#0a0a0f', fontFamily: 'Syne, sans-serif',
            }}>M</div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>Persona Engine</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em' }}>BEHAVIORAL DNA</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 24px 0', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 12 }}>INGESTED MEETINGS</div>
          {meetings.slice(0, 5).map((m, i) => (
            <div key={i} style={{ padding: '8px 12px', marginBottom: 4, borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 500, marginBottom: 2, lineHeight: 1.3 }}>{m.title}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>{m.date} · {m.duration}min</div>
            </div>
          ))}

          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 12 }}>PEOPLE ({people.length})</div>
            {people.map((p, i) => (
              <button key={p.name} onClick={() => selectPerson(p)} style={{
                width: '100%', textAlign: 'left', padding: '10px 12px', marginBottom: 4,
                borderRadius: 8, cursor: 'pointer',
                background: selectedPerson?.name === p.name && !customLines ? 'rgba(127,255,212,0.08)' : 'transparent',
                border: selectedPerson?.name === p.name && !customLines ? '1px solid rgba(127,255,212,0.3)' : '1px solid transparent',
                transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: avatarColors[i % 5],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#0a0a0f', flexShrink: 0, fontFamily: 'Syne, sans-serif',
                }}>{p.avatar}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{p.role}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Paste your own transcript */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 10 }}>YOUR OWN TRANSCRIPT</div>
            <button
              onClick={() => setShowTranscriptModal(true)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                background: customLines ? 'rgba(127,255,212,0.08)' : 'var(--surface2)',
                border: customLines ? '1px solid rgba(127,255,212,0.3)' : '1px solid var(--border)',
                color: customLines ? 'var(--accent)' : 'var(--muted)',
                fontSize: 12, fontFamily: 'DM Mono, monospace', textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              {customLines ? `✓ ${selectedPerson?.name} (custom)` : '+ Paste transcript'}
            </button>
          </div>
        </div>

        <div style={{ padding: '20px 24px 0', borderTop: '1px solid var(--border)', marginTop: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
            &ldquo;99% of the context AI needs is never written down — it&apos;s spoken.&rdquo;
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 40 }}>
        {!selectedPerson && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, rgba(127,255,212,0.15), rgba(167,139,250,0.15))', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 20 }}>🧬</div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>Meeting Persona Engine</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', maxWidth: 420, lineHeight: 1.7 }}>
              Select a person from the sidebar — or paste your own transcript to generate a behavioral DNA profile from how they actually speak.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Communication DNA', 'Influence Mapping', 'Response Prediction', 'Working Playbook'].map(f => (
                <span key={f} className="tag" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)' }}>{f}</span>
              ))}
            </div>
          </div>
        )}

        {selectedPerson && (
          <div className="animate-fadeIn">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: `linear-gradient(135deg, ${avatarColor}, #a78bfa)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: '#0a0a0f', fontFamily: 'Syne, sans-serif',
              }}>{selectedPerson.avatar}</div>
              <div>
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700 }}>{selectedPerson.name}</h1>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>{selectedPerson.role} · {customLines ? 'custom transcript' : `${selectedPerson.meetingCount} meetings analyzed`}</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                {customLines && <span className="tag" style={{ background: 'rgba(167,139,250,0.1)', color: 'var(--accent2)', border: '1px solid rgba(167,139,250,0.2)' }}>CUSTOM TRANSCRIPT</span>}
                {profile && (
                  <button
                    onClick={() => setCardVisible(v => !v)}
                    style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--muted)', fontSize: 11, cursor: 'pointer', fontFamily: 'DM Mono, monospace', letterSpacing: '0.08em' }}
                  >
                    {cardVisible ? 'HIDE CARD' : '↗ SHARE CARD'}
                  </button>
                )}
              </div>
            </div>

            {/* Shareable Card */}
            {cardVisible && profile && (
              <div className="animate-fadeIn" style={{ marginBottom: 28 }}>
                <div ref={cardRef} style={{
                  background: 'linear-gradient(135deg, #0f0f1a 0%, #111118 100%)',
                  border: '1px solid rgba(127,255,212,0.3)',
                  borderRadius: 16, padding: 28,
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: 20,
                }}>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 20, borderBottom: '1px solid rgba(127,255,212,0.1)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${avatarColor}, #a78bfa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#0a0a0f', fontFamily: 'Syne, sans-serif' }}>{selectedPerson.avatar}</div>
                    <div>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: '#e8e8f0' }}>{selectedPerson.name}</div>
                      <div style={{ fontSize: 12, color: '#7fffd4' }}>{profile.communicationStyle.label}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: 10, color: '#6b6b80', fontFamily: 'DM Mono, monospace' }}>PERSONA ENGINE · BEHAVIORAL DNA</div>
                  </div>

                  {[
                    { label: 'COMMUNICATION', value: profile.communicationStyle.label },
                    { label: 'DECISIONS', value: profile.decisionPattern.label },
                    { label: 'UNDER PRESSURE', value: profile.stressResponse.label },
                    { label: 'INFLUENCE', value: profile.influenceMethod.label },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: 9, color: '#6b6b80', letterSpacing: '0.12em', marginBottom: 6 }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#e8e8f0' }}>{item.value}</div>
                    </div>
                  ))}

                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid rgba(127,255,212,0.1)' }}>
                    {Object.entries(profile.radarScores).map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ fontSize: 16, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#7fffd4' }}>{val}</div>
                        <div style={{ fontSize: 9, color: '#6b6b80', textAlign: 'center' }}>{key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ gridColumn: '1 / -1', fontSize: 10, color: '#6b6b80', fontFamily: 'DM Mono, monospace' }}>
                    github.com/Rabba-Meghana/Meeting-Engine-Persona-
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
                  Take a screenshot of this card to share on LinkedIn ↑
                </div>
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: '1px solid var(--border)' }}>
              {(['profile', 'predict', 'working'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '10px 20px', fontSize: 12, letterSpacing: '0.08em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  background: 'none', border: 'none',
                  color: activeTab === tab ? 'var(--accent)' : 'var(--muted)',
                  borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                  marginBottom: -1, transition: 'all 0.15s', fontFamily: 'DM Mono, monospace',
                }}>
                  {tab === 'profile' ? 'Behavioral Profile' : tab === 'predict' ? 'Predict Response' : 'Working With'}
                </button>
              ))}
            </div>

            {loadingProfile && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--accent)', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>Analyzing {selectedPerson.name}&apos;s communication DNA...</div>
              </div>
            )}

            {/* PROFILE TAB */}
            {!loadingProfile && profile && activeTab === 'profile' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 16 }}>BEHAVIORAL RADAR</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'DM Mono' }} />
                      <Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 16 }}>SIGNATURE PHRASES</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                    {profile.keyPhrases.map(p => (
                      <span key={p} className="tag" style={{ background: 'rgba(127,255,212,0.08)', color: 'var(--accent)', border: '1px solid rgba(127,255,212,0.2)' }}>{p}</span>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    {[
                      { label: 'Talk Time', value: `${profile.talkTimePercent}%` },
                      { label: 'Interrupts', value: profile.interruptionTendency },
                      { label: 'Questions', value: profile.questionFrequency },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {[
                  { key: 'communicationStyle', icon: '💬', color: '#7fffd4' },
                  { key: 'decisionPattern', icon: '🎯', color: '#a78bfa' },
                  { key: 'stressResponse', icon: '⚡', color: '#f472b6' },
                  { key: 'influenceMethod', icon: '🔮', color: '#fbbf24' },
                ].map(({ key, icon, color }) => {
                  const trait = profile[key as keyof Profile] as { label: string; description: string }
                  return (
                    <div key={key} className="card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span>{icon}</span>
                        <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em' }}>
                          {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 600, color, marginBottom: 8 }}>{trait.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{trait.description}</div>
                    </div>
                  )
                })}

                {profile.influenceMap && profile.influenceMap.length > 0 && (
                  <div className="card" style={{ padding: 24, gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 16 }}>INFLUENCE MAP</div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {profile.influenceMap.map(im => (
                        <div key={im.person} style={{ padding: '12px 16px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 180px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>{im.person}</div>
                            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>
                              {im.direction === 'gives' ? `${selectedPerson.name} → influences` : im.direction === 'receives' ? 'influenced by' : 'mutual'}
                            </div>
                            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                              <div style={{ height: '100%', width: `${im.influence}%`, background: 'var(--accent)', borderRadius: 2 }} />
                            </div>
                          </div>
                          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{im.influence}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PREDICT TAB */}
            {!loadingProfile && activeTab === 'predict' && (
              <div style={{ maxWidth: 720 }}>
                <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 12 }}>
                    WHAT ARE YOU PROPOSING TO {selectedPerson.name.toUpperCase()}?
                  </div>
                  <textarea
                    value={proposal}
                    onChange={e => setProposal(e.target.value)}
                    placeholder={`Describe your proposal or idea. e.g. "Delay the Q3 launch by 3 weeks to ensure reliability"`}
                    style={{
                      width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                      borderRadius: 8, color: 'var(--text)', fontFamily: 'DM Mono, monospace',
                      fontSize: 13, padding: 16, resize: 'vertical', minHeight: 100,
                      outline: 'none', lineHeight: 1.6,
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button className="btn-primary" onClick={runPrediction} disabled={loadingPrediction || !proposal.trim()}>
                      {loadingPrediction ? 'Analyzing...' : 'Predict Their Response →'}
                    </button>
                  </div>
                </div>

                {loadingPrediction && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 20, color: 'var(--muted)', fontSize: 13 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--accent)', animation: 'spin 1s linear infinite' }} />
                    Modeling {selectedPerson.name}&apos;s response...
                  </div>
                )}

                {prediction && (
                  <div className="animate-fadeIn" style={{ display: 'grid', gap: 16 }}>
                    <div className="card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{
                          padding: '4px 14px', borderRadius: 999,
                          background: `${REACTION_COLORS[prediction.initialReaction] || '#7fffd4'}20`,
                          border: `1px solid ${REACTION_COLORS[prediction.initialReaction] || '#7fffd4'}40`,
                          color: REACTION_COLORS[prediction.initialReaction] || '#7fffd4',
                          fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                        }}>{prediction.initialReaction}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Initial reaction</div>
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.7 }}>{prediction.reactionReason}</div>
                    </div>

                    <div className="card" style={{ padding: 20 }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 14 }}>OUTCOME PROBABILITY</div>
                      {[
                        { label: 'Approve', val: prediction.probability.approve, color: '#7fffd4' },
                        { label: 'Pushback', val: prediction.probability.pushback, color: '#f472b6' },
                        { label: 'Defer', val: prediction.probability.defer, color: '#a78bfa' },
                      ].map(p => (
                        <div key={p.label} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                            <span style={{ color: 'var(--muted)' }}>{p.label}</span>
                            <span style={{ color: p.color, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{p.val}%</span>
                          </div>
                          <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
                            <div style={{ height: '100%', width: `${p.val}%`, background: p.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="card" style={{ padding: 20 }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 10 }}>THEIR FIRST QUESTION</div>
                      <div style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--accent)', lineHeight: 1.6 }}>
                        &ldquo;{prediction.likelyFirstQuestion}&rdquo;
                      </div>
                    </div>

                    <div className="card" style={{ padding: 20 }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 10 }}>HOW TO FRAME IT</div>
                      <div style={{ fontSize: 13, lineHeight: 1.7 }}>{prediction.howToFrameIt}</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="card" style={{ padding: 20 }}>
                        <div style={{ fontSize: 11, color: '#7fffd4', letterSpacing: '0.1em', marginBottom: 10 }}>✓ USE THESE PHRASES</div>
                        {prediction.keyPhrasesToUse.map(p => (
                          <div key={p} style={{ fontSize: 12, marginBottom: 6, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>&ldquo;{p}&rdquo;</div>
                        ))}
                      </div>
                      <div className="card" style={{ padding: 20 }}>
                        <div style={{ fontSize: 11, color: '#f472b6', letterSpacing: '0.1em', marginBottom: 10 }}>✗ AVOID THESE</div>
                        {prediction.keyPhrasesToAvoid.map(p => (
                          <div key={p} style={{ fontSize: 12, marginBottom: 6, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>&ldquo;{p}&rdquo;</div>
                        ))}
                      </div>
                    </div>

                    {prediction.potentialObjection && (
                      <div className="card" style={{ padding: 20, borderColor: 'rgba(244,114,182,0.3)' }}>
                        <div style={{ fontSize: 11, color: '#f472b6', letterSpacing: '0.1em', marginBottom: 10 }}>LIKELY OBJECTION</div>
                        <div style={{ fontSize: 13, lineHeight: 1.7 }}>{prediction.potentialObjection}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* WORKING WITH TAB */}
            {!loadingProfile && profile && activeTab === 'working' && (
              <div style={{ display: 'grid', gap: 16, maxWidth: 720 }} className="animate-fadeIn">
                <div className="card" style={{ padding: 24, borderColor: 'rgba(127,255,212,0.2)' }}>
                  <div style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 12 }}>✓ HOW TO WORK WITH {selectedPerson.name.split(' ')[0].toUpperCase()}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.8 }}>{profile.workingWithTip}</div>
                </div>
                <div className="card" style={{ padding: 24, borderColor: 'rgba(244,114,182,0.2)' }}>
                  <div style={{ fontSize: 11, color: '#f472b6', letterSpacing: '0.1em', marginBottom: 12 }}>✗ NEVER DO THIS</div>
                  <div style={{ fontSize: 14, lineHeight: 1.8 }}>{profile.avoidWith}</div>
                </div>
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 12 }}>BLIND SPOTS</div>
                  <div style={{ fontSize: 14, lineHeight: 1.8 }}>{profile.blindSpots}</div>
                </div>
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 16 }}>PRE-MEETING BRIEF</div>
                  <div style={{ padding: 16, background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'DM Mono, monospace' }}>
                    <div style={{ fontSize: 10, color: 'var(--accent)', marginBottom: 10 }}>AUTO-GENERATED · {new Date().toLocaleDateString()}</div>
                    <div style={{ fontSize: 12, lineHeight: 1.8 }}>
                      <strong style={{ color: 'var(--accent)' }}>{selectedPerson.name}</strong> tends to communicate as a <em>{profile.communicationStyle.label}</em>.
                      They make decisions by {profile.decisionPattern.description.toLowerCase().substring(0, 60)}...
                      Under pressure, expect {profile.stressResponse.label.toLowerCase()} behavior.
                      <br /><br />
                      Key phrases to use: {profile.keyPhrases.slice(0, 2).map(p => `"${p}"`).join(', ')}.
                      <br /><br />
                      Remember: {profile.workingWithTip}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Cell, Tooltip
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

const REACTION_COLORS: Record<string, string> = {
  enthusiastic: '#7fffd4',
  skeptical: '#f472b6',
  neutral: '#a78bfa',
  cautious: '#fbbf24',
}

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

  useEffect(() => {
    fetch('/api/meetings')
      .then(r => r.json())
      .then(d => {
        setPeople(d.people)
        setMeetings(d.meetings)
      })
  }, [])

  const loadProfile = useCallback(async (person: Person) => {
    setProfile(null)
    setPrediction(null)
    setLoadingProfile(true)
    setActiveTab('profile')
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personName: person.name, mode: 'profile' }),
      })
      const raw = await r.text()
      const d = raw ? JSON.parse(raw) : {}
      if (!r.ok) throw new Error(d.error || 'Failed to load profile')
      setProfile(d.profile)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingProfile(false)
    }
  }, [])

  const selectPerson = (person: Person) => {
    setSelectedPerson(person)
    loadProfile(person)
  }

  const runPrediction = async () => {
    if (!selectedPerson || !proposal.trim()) return
    setLoadingPrediction(true)
    setPrediction(null)
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personName: selectedPerson.name, mode: 'predict', proposal }),
      })
      const raw = await r.text()
      const d = raw ? JSON.parse(raw) : {}
      if (!r.ok) throw new Error(d.error || 'Failed to predict response')
      setPrediction(d.prediction)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingPrediction(false)
    }
  }

  const radarData = profile ? Object.entries(profile.radarScores).map(([key, val]) => ({
    subject: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
    value: val,
  })) : []

  const avatarColors = ['#7fffd4', '#a78bfa', '#f472b6', '#fbbf24']

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Sidebar */}
      <aside style={{
        width: 280, flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '28px 0',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 24px 28px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #7fffd4, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#0a0a0f',
              fontFamily: 'Syne, sans-serif',
            }}>M</div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>
                Persona Engine
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em' }}>RECALL.AI × GROQ</div>
            </div>
          </div>
        </div>

        {/* Meetings */}
        <div style={{ padding: '20px 24px 0', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 12 }}>
            INGESTED MEETINGS
          </div>
          {meetings.slice(0, 5).map((m, i) => (
            <div key={i} style={{
              padding: '8px 12px', marginBottom: 4,
              borderRadius: 6, background: 'var(--surface2)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 500, marginBottom: 2, lineHeight: 1.3 }}>{m.title}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>{m.date} · {m.duration}min</div>
            </div>
          ))}

          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 12 }}>
              PEOPLE ({people.length})
            </div>
            {people.map((p, i) => (
              <button
                key={p.name}
                onClick={() => selectPerson(p)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '10px 12px', marginBottom: 4,
                  borderRadius: 8, cursor: 'pointer',
                  background: selectedPerson?.name === p.name ? 'rgba(127,255,212,0.08)' : 'transparent',
                  border: selectedPerson?.name === p.name ? '1px solid rgba(127,255,212,0.3)' : '1px solid transparent',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: avatarColors[i % 4],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#0a0a0f', flexShrink: 0,
                  fontFamily: 'Syne, sans-serif',
                }}>{p.avatar}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{p.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer quote */}
        <div style={{ padding: '20px 24px 0', borderTop: '1px solid var(--border)', marginTop: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
            "99% of the context AI needs is never written down — it's spoken."
          </div>
          <div style={{ fontSize: 10, color: 'var(--accent)', marginTop: 4 }}>— David Gu, Recall.ai</div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 40 }}>
        {!selectedPerson && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(127,255,212,0.15), rgba(167,139,250,0.15))',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, marginBottom: 20,
            }}>🧬</div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>
              Meeting Persona Engine
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', maxWidth: 420, lineHeight: 1.7 }}>
              Select a person from the sidebar to generate their behavioral DNA profile — built entirely from how they speak.
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
            {/* Person Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: `linear-gradient(135deg, ${avatarColors[people.findIndex(p => p.name === selectedPerson.name) % 4]}, #a78bfa)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: '#0a0a0f',
                fontFamily: 'Syne, sans-serif',
              }}>{selectedPerson.avatar}</div>
              <div>
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700 }}>{selectedPerson.name}</h1>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>{selectedPerson.role} · {selectedPerson.meetingCount} meetings analyzed</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="tag" style={{ background: 'rgba(127,255,212,0.1)', color: 'var(--accent)', border: '1px solid rgba(127,255,212,0.2)' }}>
                  GROQ ANALYZED
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: '1px solid var(--border)' }}>
              {(['profile', 'predict', 'working'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '10px 20px', fontSize: 12, letterSpacing: '0.08em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  background: 'none', border: 'none',
                  color: activeTab === tab ? 'var(--accent)' : 'var(--muted)',
                  borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                  marginBottom: -1, transition: 'all 0.15s',
                  fontFamily: 'DM Mono, monospace',
                }}>
                  {tab === 'profile' ? 'Behavioral Profile' : tab === 'predict' ? 'Predict Response' : 'Working With'}
                </button>
              ))}
            </div>

            {/* Loading state */}
            {loadingProfile && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  border: '2px solid var(--border)',
                  borderTop: '2px solid var(--accent)',
                  animation: 'spin 1s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>Analyzing {selectedPerson.name}&apos;s communication DNA...</div>
              </div>
            )}

            {/* PROFILE TAB */}
            {!loadingProfile && profile && activeTab === 'profile' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                {/* Radar Chart */}
                <div className="card" style={{ padding: 24, gridColumn: '1', gridRow: '1' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 16 }}>BEHAVIORAL RADAR</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'DM Mono' }} />
                      <Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Key phrases + stats */}
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

                {/* 4 trait cards */}
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
                      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 600, color, marginBottom: 8 }}>
                        {trait.label}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{trait.description}</div>
                    </div>
                  )
                })}

                {/* Influence map */}
                {profile.influenceMap && profile.influenceMap.length > 0 && (
                  <div className="card" style={{ padding: 24, gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 16 }}>INFLUENCE MAP</div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {profile.influenceMap.map(im => (
                        <div key={im.person} style={{
                          padding: '12px 16px', borderRadius: 8,
                          background: 'var(--surface2)', border: '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 180px',
                        }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>{im.person}</div>
                            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>
                              {im.direction === 'gives' ? `${selectedPerson.name} → influences` : im.direction === 'receives' ? 'influenced by' : 'mutual'}
                            </div>
                            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, width: 120 }}>
                              <div style={{ height: '100%', width: `${im.influence}%`, background: 'var(--accent)', borderRadius: 2 }} />
                            </div>
                          </div>
                          <div style={{ marginLeft: 'auto', fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
                            {im.influence}
                          </div>
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
                    placeholder={`Describe your proposal, idea, or ask. E.g. "Delay the Q3 launch by 3 weeks to add the enterprise SSO feature"`}
                    style={{
                      width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                      borderRadius: 8, color: 'var(--text)', fontFamily: 'DM Mono, monospace',
                      fontSize: 13, padding: 16, resize: 'vertical', minHeight: 100,
                      outline: 'none', lineHeight: 1.6,
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button
                      className="btn-primary"
                      onClick={runPrediction}
                      disabled={loadingPrediction || !proposal.trim()}
                    >
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
                    {/* Reaction */}
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

                    {/* Probability bars */}
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

                    {/* First question */}
                    <div className="card" style={{ padding: 20 }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 10 }}>THEIR FIRST QUESTION</div>
                      <div style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--accent)', lineHeight: 1.6 }}>
                        &ldquo;{prediction.likelyFirstQuestion}&rdquo;
                      </div>
                    </div>

                    {/* How to frame */}
                    <div className="card" style={{ padding: 20 }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 10 }}>HOW TO FRAME IT</div>
                      <div style={{ fontSize: 13, lineHeight: 1.7 }}>{prediction.howToFrameIt}</div>
                    </div>

                    {/* Phrases to use/avoid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="card" style={{ padding: 20 }}>
                        <div style={{ fontSize: 11, color: '#7fffd4', letterSpacing: '0.1em', marginBottom: 10 }}>✓ USE THESE PHRASES</div>
                        {prediction.keyPhrasesToUse.map(p => (
                          <div key={p} style={{ fontSize: 12, color: 'var(--text)', marginBottom: 6, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>&ldquo;{p}&rdquo;</div>
                        ))}
                      </div>
                      <div className="card" style={{ padding: 20 }}>
                        <div style={{ fontSize: 11, color: '#f472b6', letterSpacing: '0.1em', marginBottom: 10 }}>✗ AVOID THESE</div>
                        {prediction.keyPhrasesToAvoid.map(p => (
                          <div key={p} style={{ fontSize: 12, color: 'var(--text)', marginBottom: 6, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>&ldquo;{p}&rdquo;</div>
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
                  <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text)' }}>{profile.blindSpots}</div>
                </div>
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 16 }}>PRE-MEETING BRIEF</div>
                  <div style={{ padding: 16, background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'DM Mono, monospace' }}>
                    <div style={{ fontSize: 10, color: 'var(--accent)', marginBottom: 10 }}>AUTO-GENERATED · {new Date().toLocaleDateString()}</div>
                    <div style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--text)' }}>
                      <strong style={{ color: 'var(--accent)' }}>{selectedPerson.name}</strong> tends to communicate as a{' '}
                      <em>{profile.communicationStyle.label}</em>. They make decisions by{' '}
                      {profile.decisionPattern.description.toLowerCase().substring(0, 60)}... Under pressure, expect{' '}
                      {profile.stressResponse.label.toLowerCase()} behavior.
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

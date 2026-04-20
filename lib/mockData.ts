export interface Meeting {
  id: string
  title: string
  date: string
  duration: number // minutes
  participants: string[]
  transcript: { speaker: string; text: string; timestamp: number }[]
}

export interface Person {
  name: string
  avatar: string
  role: string
  meetingCount: number
}

export const PEOPLE: Person[] = [
  { name: 'David Gu', avatar: 'DG', role: 'Co-founder & CEO', meetingCount: 5 },
  { name: 'Amanda Zhu', avatar: 'AZ', role: 'Co-founder & CTO', meetingCount: 5 },
  { name: 'Marcus Webb', avatar: 'MW', role: 'Head of Sales', meetingCount: 4 },
  { name: 'Priya Nair', avatar: 'PN', role: 'Lead Engineer', meetingCount: 3 },
]

export const MEETINGS: Meeting[] = [
  {
    id: 'm1',
    title: 'Q3 Roadmap Planning',
    date: '2024-03-15',
    duration: 47,
    participants: ['David Gu', 'Amanda Zhu', 'Marcus Webb', 'Priya Nair'],
    transcript: [
      { speaker: 'David Gu', text: "Okay so I've been thinking about this a lot. The core question is — do we ship the webhooks feature in Q3 or do we push it to Q4? I think we're trying to do too much.", timestamp: 12 },
      { speaker: 'Amanda Zhu', text: "The webhooks refactor alone is going to take three sprints minimum. If we commit to Q3, we're setting ourselves up to cut corners. What's the actual customer pressure here?", timestamp: 45 },
      { speaker: 'Marcus Webb', text: "I've had four enterprise calls this week where webhooks came up. Twilio is blocking us from two deals specifically because of it. I'm not saying it's easy — I'm saying it's urgent.", timestamp: 78 },
      { speaker: 'Priya Nair', text: "Marcus is right that it's coming up a lot. I think we can scope it differently — ship a minimal webhooks v1 that handles the Twilio blocker specifically, and defer the full refactor.", timestamp: 112 },
      { speaker: 'David Gu', text: "That's actually interesting. What would v1 look like exactly? Because if we're going to ship something, I don't want it to be embarrassing. Our reliability is our brand.", timestamp: 145 },
      { speaker: 'Amanda Zhu', text: "Priya, what's your confidence on a 6-week minimal version? And I mean truly minimal — auth, retry logic, basic filtering. Nothing else.", timestamp: 178 },
      { speaker: 'Priya Nair', text: "Six weeks is tight but doable if Marcus can get me three solid customer specs to design against. I don't want to build against assumptions again.", timestamp: 210 },
      { speaker: 'Marcus Webb', text: "Done. I'll have specs to you by Friday. Two of those customers will probably do a beta too if we ask.", timestamp: 234 },
      { speaker: 'David Gu', text: "Okay. Let's do the scoped v1. But Amanda, I want you personally reviewing the reliability layer before it ships. This isn't negotiable for me.", timestamp: 267 },
      { speaker: 'Amanda Zhu', text: "Agreed. I'll own the review. Priya — let's sync Monday before standup to map out the spec dependencies.", timestamp: 290 },
    ]
  },
  {
    id: 'm2',
    title: 'Customer Escalation — Synthesia',
    date: '2024-03-22',
    duration: 31,
    participants: ['David Gu', 'Amanda Zhu', 'Marcus Webb'],
    transcript: [
      { speaker: 'Marcus Webb', text: "So Synthesia's head of engineering sent a pretty sharp email last night. Three bot failures in two days on their largest customer account. I want to get ahead of this before it escalates further.", timestamp: 8 },
      { speaker: 'David Gu', text: "I saw the email. This is on us. What actually happened? Walk me through the failure chain.", timestamp: 35 },
      { speaker: 'Amanda Zhu', text: "I've been in the logs since 6am. It's a race condition in the bot reconnect logic — when the meeting host changes mid-session, the bot drops and can't rejoin. It's a known edge case we deprioritized.", timestamp: 58 },
      { speaker: 'David Gu', text: "We deprioritized something that can drop a customer's production bot. Okay. When can we patch it?", timestamp: 90 },
      { speaker: 'Amanda Zhu', text: "Priya already has a branch. It's a two-day fix. But I want to add a regression test suite around reconnect logic before we ship — maybe five days total.", timestamp: 115 },
      { speaker: 'Marcus Webb', text: "Can I tell Synthesia we'll have a fix within the week? They need something concrete or this goes to their CEO.", timestamp: 140 },
      { speaker: 'David Gu', text: "Tell them five business days, we'll give them early access to test, and I'll personally jump on a call with their eng lead tomorrow. This is my call to make, not a support ticket.", timestamp: 165 },
      { speaker: 'Amanda Zhu', text: "I'll have Priya's patch reviewed by Wednesday. David — I'll prep the technical brief you'll need for the call.", timestamp: 192 },
      { speaker: 'Marcus Webb', text: "Perfect. I'll set up the call for tomorrow 2pm. David, should I loop in their head of eng or keep it at the practitioner level first?", timestamp: 215 },
      { speaker: 'David Gu', text: "Head of eng first. I want to understand what they actually need technically before it becomes a relationship conversation.", timestamp: 238 },
    ]
  },
  {
    id: 'm3',
    title: 'Series B Prep — Investor Narrative',
    date: '2024-04-01',
    duration: 55,
    participants: ['David Gu', 'Amanda Zhu', 'Marcus Webb'],
    transcript: [
      { speaker: 'David Gu', text: "We have eight weeks before the roadshow. I want to pressure test the narrative today. Marcus, you've heard the most objections — what's the one thing investors push back on hardest?", timestamp: 15 },
      { speaker: 'Marcus Webb', text: "Defensibility. Every time. They ask — can Zoom or Microsoft just build this? And honestly, we don't have a crisp answer yet.", timestamp: 48 },
      { speaker: 'Amanda Zhu', text: "The technical answer is: yes they can build it, but the switching cost after you're embedded in our stack is enormous. We have 200 customers who've built entire products on our API. That's real lock-in.", timestamp: 75 },
      { speaker: 'David Gu', text: "I don't love leading with lock-in as our defensibility story. It sounds defensive. I'd rather lead with what we know that nobody else does — five years of edge cases in production meeting bots.", timestamp: 108 },
      { speaker: 'Marcus Webb', text: "That's actually a better frame. 'We've seen every failure mode' — that's something you can't buy, you have to earn it.", timestamp: 138 },
      { speaker: 'Amanda Zhu', text: "We should quantify it. We've processed over 50 million meeting minutes. That's the real moat — not the code, the operational knowledge baked into our infrastructure decisions.", timestamp: 162 },
      { speaker: 'David Gu', text: "Fifty million minutes. That's the number. Amanda, can you build a one-slide technical moat story around that? Concrete examples of what we know how to do that nobody else does yet.", timestamp: 195 },
      { speaker: 'Amanda Zhu', text: "I'll do it. The ring buffer / IPC story is the best example — we eliminated WebSockets and saved a million dollars in compute. That's the kind of thing that only comes from obsessing over this problem.", timestamp: 225 },
      { speaker: 'Marcus Webb', text: "I want to use that story in the roadshow. It's concrete, it's impressive, and it answers the defensibility question without sounding defensive.", timestamp: 252 },
      { speaker: 'David Gu', text: "Agreed. Let's build the whole deck around earned knowledge rather than features. Features can be copied. What we know can't.", timestamp: 278 },
    ]
  },
  {
    id: 'm4',
    title: 'Hiring Review — Senior Eng Candidates',
    date: '2024-04-08',
    duration: 42,
    participants: ['David Gu', 'Amanda Zhu', 'Priya Nair'],
    transcript: [
      { speaker: 'Amanda Zhu', text: "We have three finalists. I want to go through them quickly because I think we're close on one of them but I have a real concern on the front-runner.", timestamp: 10 },
      { speaker: 'David Gu', text: "Tell me the concern first.", timestamp: 38 },
      { speaker: 'Amanda Zhu', text: "Candidate A — technically exceptional, best systems design I've seen in this process. But in the interview debrief he said he prefers working 'heads down' and finds customer support rotations distracting. That's a red flag for me.", timestamp: 55 },
      { speaker: 'Priya Nair', text: "I noticed that too. He also didn't ask a single question about how the team operates. Which surprised me — usually the strongest candidates are the most curious about the environment.", timestamp: 95 },
      { speaker: 'David Gu', text: "That's disqualifying for me. I don't care how good the systems design is — we're at 20 people, everyone talks to customers. That's not going to change for a long time and I don't want to build a culture that accommodates it.", timestamp: 125 },
      { speaker: 'Amanda Zhu', text: "Agreed. So Candidate B — solid, not exceptional. She's worked in audio/video infrastructure before which is a real plus. She asked great questions about our latency targets.", timestamp: 155 },
      { speaker: 'Priya Nair', text: "She'd ramp fast because of the AV background. My concern is growth ceiling — I'm not sure she has the ambition to grow into a staff role in two years.", timestamp: 188 },
      { speaker: 'David Gu', text: "What's your gut on Candidate C?", timestamp: 215 },
      { speaker: 'Amanda Zhu', text: "Candidate C is my pick. Less experienced but the sharpest thinker. In the take-home, she found a bug we didn't even know existed in our mock infrastructure. That's the kind of thing I can't train.", timestamp: 232 },
      { speaker: 'David Gu', text: "She found a bug we didn't know about. Done. Make the offer today. Don't let her sit on this for a week — candidates at her level have options.", timestamp: 268 },
      { speaker: 'Priya Nair', text: "I'll reach out this afternoon. Do we have flexibility on the offer package if she counters?", timestamp: 292 },
      { speaker: 'David Gu', text: "Yes. Amanda, what's our ceiling on comp for this role?", timestamp: 315 },
      { speaker: 'Amanda Zhu', text: "We have headroom. Priya — go to 10% above our initial offer if she counters, but don't lead with it. See what she actually needs.", timestamp: 330 },
    ]
  },
  {
    id: 'm5',
    title: 'Weekly Sync — Product & Engineering',
    date: '2024-04-15',
    duration: 38,
    participants: ['David Gu', 'Amanda Zhu', 'Marcus Webb', 'Priya Nair'],
    transcript: [
      { speaker: 'Priya Nair', text: "Shipping update: webhooks v1 is on track for Friday. We're in final testing. One edge case with Teams meetings that I want to flag — bot join latency spikes to 8 seconds on enterprise accounts.", timestamp: 12 },
      { speaker: 'Amanda Zhu', text: "Eight seconds is too high for what we promised. What's causing it?", timestamp: 42 },
      { speaker: 'Priya Nair', text: "Teams enterprise does an extra auth handshake that we weren't accounting for. I have a workaround but it adds complexity to the join flow.", timestamp: 62 },
      { speaker: 'David Gu', text: "Is the workaround reliable or is it a band-aid?", timestamp: 88 },
      { speaker: 'Priya Nair', text: "It's reliable. It's just not elegant. We can refactor it properly in the next sprint.", timestamp: 108 },
      { speaker: 'David Gu', text: "Ship it. Reliable beats elegant every time. Document it, schedule the refactor, and let's not delay Friday over aesthetics.", timestamp: 128 },
      { speaker: 'Marcus Webb', text: "Speaking of Friday — Twilio confirmed they want to be first on the webhooks beta. And the Synthesia relationship is fully repaired, they actually sent a nice note to David after the call.", timestamp: 155 },
      { speaker: 'David Gu', text: "Good. What's the pipeline looking like? Are we seeing any pattern in what's converting vs stalling?", timestamp: 182 },
      { speaker: 'Marcus Webb', text: "Converts fastest when the champion is an engineer. Stalls when it goes to procurement before the technical win is fully established. We need a better POC process to accelerate the technical win.", timestamp: 210 },
      { speaker: 'Amanda Zhu', text: "Priya — can we build a sandbox environment that's customer-facing? Something they can play with before procurement gets involved?", timestamp: 242 },
      { speaker: 'Priya Nair', text: "Yes. It's maybe three weeks of work. I'd need to carve out time from the roadmap.", timestamp: 268 },
      { speaker: 'David Gu', text: "Do it. Marcus, if a sandbox cuts deal cycle by even two weeks on average, what's the revenue impact?", timestamp: 290 },
      { speaker: 'Marcus Webb', text: "Meaningfully. I'd estimate we're losing 20-30% of deals purely to procurement delay. Fixing the technical win speed changes everything.", timestamp: 315 },
      { speaker: 'David Gu', text: "Priya, the sandbox is now the top priority after webhooks ships. Amanda — please make sure she has cover to focus on it.", timestamp: 340 },
    ]
  }
]

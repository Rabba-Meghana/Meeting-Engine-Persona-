export interface Meeting {
  id: string
  title: string
  date: string
  duration: number
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
  { name: 'Alex Rivers', avatar: 'AR', role: 'Co-founder & CEO', meetingCount: 5 },
  { name: 'Priyaharma', avatar: 'PS', role: 'Co-founder & CTO', meetingCount: 5 },
  { name: 'Jordan Mills', avatar: 'JM', role: 'Head of Sales', meetingCount: 4 },
  { name: 'Nadia Osei', avatar: 'NO', role: 'Lead Engineer', meetingCount: 4 },
  { name: 'Marcusee', avatar: 'ML', role: 'Head of Hiring', meetingCount: 4 },
]

export const MEETINGS: Meeting[] = [
  {
    id: 'm1',
    title: 'Q3 Roadmap Planning',
    date: '2024-03-15',
    duration: 47,
    participants: ['Alex Rivers', 'Priyaharma', 'Jordan Mills', 'Nadia Osei'],
    transcript: [
      { speaker: 'Alex Rivers', text: "Okay so I've been thinking about this a lot. The core question is: do we ship the webhooks feature in Q3 or do we push it to Q4? I think we're trying to do too much.", timestamp: 12 },
      { speaker: 'Priyaharma', text: "The webhooks refactor alone is going to take three sprints minimum. If we commit to Q3, we're setting ourselves up to cut corners. What's the actual customer pressure here?", timestamp: 45 },
      { speaker: 'Jordan Mills', text: "I've had four enterprise calls this week where webhooks came up. Stripe is blocking us from two deals specifically because of it. I'm not saying it's easy — I'm saying it's urgent.", timestamp: 78 },
      { speaker: 'Nadia Osei', text: "Marcus is right that it's coming up a lot. I think we can scope it differently — ship a minimal webhooks v1 that handles the Stripe blocker specifically, and defer the full refactor.", timestamp: 112 },
      { speaker: 'Alex Rivers', text: "That's actually interesting. What would v1 look like exactly? Because if we're going to ship something, I don't want it to be embarrassing. Our reliability is our brand.", timestamp: 145 },
      { speaker: 'Priyaharma', text: "Priya, what's your confidence on a 6-week minimal version? And I mean truly minimal — auth, retry logic, basic filtering. Nothing else.", timestamp: 178 },
      { speaker: 'Nadia Osei', text: "Six weeks is tight but doable if Marcus can get me three solid customer specs to design against. I don't want to build against assumptions again.", timestamp: 210 },
      { speaker: 'Jordan Mills', text: "Done. I'll have specs to you by Friday. Two of those customers will probably do a beta too if we ask.", timestamp: 234 },
      { speaker: 'Alex Rivers', text: "Okay. Let's do the scoped v1. But Priya, I want you personally reviewing the reliability layer before it ships. This isn't negotiable for me.", timestamp: 267 },
      { speaker: 'Priyaharma', text: "Agreed. I'll own the review. Priya — let's sync Monday before standup to map out the spec dependencies.", timestamp: 290 },
    ]
  },
  {
    id: 'm2',
    title: 'Customer Escalation — Vertex AI',
    date: '2024-03-22',
    duration: 31,
    participants: ['Alex Rivers', 'Priyaharma', 'Jordan Mills'],
    transcript: [
      { speaker: 'Jordan Mills', text: "So Vertex AI's head of engineering sent a pretty sharp email last night. Three bot failures in two days on their largest customer account. I want to get ahead of this before it escalates further.", timestamp: 8 },
      { speaker: 'Alex Rivers', text: "I saw the email. This is on us. What actually happened? Walk me through the failure chain.", timestamp: 35 },
      { speaker: 'Priyaharma', text: "I've been in the logs since 6am. It's a race condition in the bot reconnect logic — when the meeting host changes mid-session, the bot drops and can't rejoin. It's a known edge case we deprioritized.", timestamp: 58 },
      { speaker: 'Alex Rivers', text: "We deprioritized something that can drop a customer's production bot. Okay. When can we patch it?", timestamp: 90 },
      { speaker: 'Priyaharma', text: "Priya already has a branch. It's a two-day fix. But I want to add a regression test suite around reconnect logic before we ship — maybe five days total.", timestamp: 115 },
      { speaker: 'Jordan Mills', text: "Can I tell Vertex AI we'll have a fix within the week? They need something concrete or this goes to their CEO.", timestamp: 140 },
      { speaker: 'Alex Rivers', text: "Tell them five business days, we'll give them early access to test, and I'll personally jump on a call with their eng lead tomorrow. This is my call to make, not a support ticket.", timestamp: 165 },
      { speaker: 'Priyaharma', text: "I'll have Nadia's patch reviewed by Wednesday. Alex — I'll prep the technical brief you'll need for the call.", timestamp: 192 },
      { speaker: 'Jordan Mills', text: "Perfect. I'll set up the call for tomorrow 2pm. Alex, should I loop in their head of eng or keep it at the practitioner level first?", timestamp: 215 },
      { speaker: 'Alex Rivers', text: "Head of eng first. I want to understand what they actually need technically before it becomes a relationship conversation.", timestamp: 238 },
    ]
  },
  {
    id: 'm3',
    title: 'Series B Prep — Investor Narrative',
    date: '2024-04-01',
    duration: 55,
    participants: ['Alex Rivers', 'Priyaharma', 'Jordan Mills'],
    transcript: [
      { speaker: 'Alex Rivers', text: "We have eight weeks before the roadshow. I want to pressure test the narrative today. Marcus, you've heard the most objections — what's the one thing investors push back on hardest?", timestamp: 15 },
      { speaker: 'Jordan Mills', text: "Defensibility. Every time. They ask — can Zoom or Microsoft just build this? And honestly, we don't have a crisp answer yet.", timestamp: 48 },
      { speaker: 'Priyaharma', text: "The technical answer is: yes they can build it, but the switching cost after you're embedded in our stack is enormous. We have 200 customers who've built entire products on our API. That's real lock-in.", timestamp: 75 },
      { speaker: 'Alex Rivers', text: "I don't love leading with lock-in as our defensibility story. It sounds defensive. I'd rather lead with what we know that nobody else does — five years of edge cases in production meeting bots.", timestamp: 108 },
      { speaker: 'Jordan Mills', text: "That's actually a better frame. 'We've seen every failure mode' — that's something you can't buy, you have to earn it.", timestamp: 138 },
      { speaker: 'Priyaharma', text: "We should quantify it. We've processed over 50 million meeting minutes. That's the real moat — not the code, the operational knowledge baked into our infrastructure decisions.", timestamp: 162 },
      { speaker: 'Alex Rivers', text: "Fifty million minutes. That's the number. Priya, can you build a one-slide technical moat story around that? Concrete examples of what we know how to do that nobody else does yet.", timestamp: 195 },
      { speaker: 'Priyaharma', text: "I'll do it. The ring buffer / IPC story is the best example — we eliminated WebSockets and saved a million dollars in compute. That's the kind of thing that only comes from obsessing over this problem.", timestamp: 225 },
      { speaker: 'Jordan Mills', text: "I want to use that story in the roadshow. It's concrete, it's impressive, and it answers the defensibility question without sounding defensive.", timestamp: 252 },
      { speaker: 'Alex Rivers', text: "Agreed. Let's build the whole deck around earned knowledge rather than features. Features can be copied. What we know can't.", timestamp: 278 },
    ]
  },
  {
    id: 'm4',
    title: 'Hiring Review — Senior Eng Candidates',
    date: '2024-04-08',
    duration: 42,
    participants: ['Alex Rivers', 'Priyaharma', 'Nadia Osei', 'Marcusee'],
    transcript: [
      { speaker: 'Marcusee', text: "Before we go into candidates — I want to flag something structural. Our backend loop is running 5 rounds right now. I've tracked it: we lose 40% of candidates between round 3 and round 5. That's not a talent problem, it's a process problem.", timestamp: 8 },
      { speaker: 'Priyaharma', text: "We have three finalists from the current pool. I want to go through them quickly because I think we're close on one of them but I have a real concern on the front-runner.", timestamp: 35 },
      { speaker: 'Alex Rivers', text: "Tell me the concern first.", timestamp: 62 },
      { speaker: 'Priyaharma', text: "Candidate A is technically exceptional, best systems design I've seen in this process. But in the interview debrief he said he prefers working heads-down and finds customer support rotations distracting. That's a red flag for me.", timestamp: 78 },
      { speaker: 'Nadia Osei', text: "I noticed that too. He also didn't ask a single question about how the team operates. Which surprised me — usually the strongest candidates are the most curious about the environment.", timestamp: 118 },
      { speaker: 'Marcusee', text: "That curiosity signal is one I weight heavily. Candidates who don't ask about the team dynamic are either overconfident or not actually evaluating us — both are warning signs at this stage.", timestamp: 138 },
      { speaker: 'Alex Rivers', text: "That's disqualifying for me. I don't care how good the systems design is — we're at 20 people, everyone talks to customers. I don't want to build a culture that accommodates the opposite.", timestamp: 172 },
      { speaker: 'Priyaharma', text: "So Candidate B — solid, not exceptional. She's worked in audio/video infrastructure before which is a real plus. She asked great questions about our latency targets.", timestamp: 205 },
      { speaker: 'Nadia Osei', text: "She'd ramp fast because of the AV background. My concern is growth ceiling — I'm not sure she has the ambition to grow into a staff role in two years.", timestamp: 238 },
      { speaker: 'Marcusee', text: "I had a deeper conversation with her after the interview. She's interviewing at two other companies with clearer promotion ladders than ours. If we want her, we need to give her something concrete about the growth trajectory — not just vibes.", timestamp: 260 },
      { speaker: 'Alex Rivers', text: "What's your gut on Candidate C?", timestamp: 298 },
      { speaker: 'Priyaharma', text: "Candidate C is my pick. Less experienced but the sharpest thinker. In the take-home, she found a bug we didn't even know existed in our mock infrastructure. That's the kind of thing I can't train.", timestamp: 315 },
      { speaker: 'Marcusee', text: "She's also the only one who asked about our onboarding process. That tells me she's thinking about how to succeed here, not just whether to accept. That's a really healthy signal.", timestamp: 348 },
      { speaker: 'Alex Rivers', text: "She found a bug we didn't know about. Done. Make the offer today. Don't let her sit on this for a week — candidates at her level have options.", timestamp: 378 },
      { speaker: 'Nadia Osei', text: "I'll reach out this afternoon. Do we have flexibility on comp if she counters?", timestamp: 398 },
      { speaker: 'Marcusee', text: "I'd suggest we lead with the comp range upfront and give her 48 hours, not a week. Leaving candidates in ambiguity too long sends the wrong signal about how we operate.", timestamp: 415 },
      { speaker: 'Priyaharma', text: "We have headroom. Priya — go to 10% above our initial offer if she counters, but don't lead with it. See what she actually needs.", timestamp: 448 },
    ]
  },
  {
    id: 'm5',
    title: 'Weekly Sync — Product & Engineering',
    date: '2024-04-15',
    duration: 38,
    participants: ['Alex Rivers', 'Priyaharma', 'Jordan Mills', 'Nadia Osei'],
    transcript: [
      { speaker: 'Nadia Osei', text: "Shipping update: webhooks v1 is on track for Friday. We're in final testing. One edge case with Teams meetings that I want to flag — bot join latency spikes to 8 seconds on enterprise accounts.", timestamp: 12 },
      { speaker: 'Priyaharma', text: "Eight seconds is too high for what we promised. What's causing it?", timestamp: 42 },
      { speaker: 'Nadia Osei', text: "Teams enterprise does an extra auth handshake that we weren't accounting for. I have a workaround but it adds complexity to the join flow.", timestamp: 62 },
      { speaker: 'Alex Rivers', text: "Is the workaround reliable or is it a band-aid?", timestamp: 88 },
      { speaker: 'Nadia Osei', text: "It's reliable. It's just not elegant. We can refactor it properly in the next sprint.", timestamp: 108 },
      { speaker: 'Alex Rivers', text: "Ship it. Reliable beats elegant every time. Document it, schedule the refactor, and let's not delay Friday over aesthetics.", timestamp: 128 },
      { speaker: 'Jordan Mills', text: "Speaking of Friday — Stripe confirmed they want to be first on the webhooks beta. And the Vertex AI relationship is fully repaired, they actually sent a nice note to Alex after the call.", timestamp: 155 },
      { speaker: 'Alex Rivers', text: "Good. What's the pipeline looking like? Are we seeing any pattern in what's converting vs stalling?", timestamp: 182 },
      { speaker: 'Jordan Mills', text: "Converts fastest when the champion is an engineer. Stalls when it goes to procurement before the technical win is fully established. We need a better POC process to accelerate the technical win.", timestamp: 210 },
      { speaker: 'Priyaharma', text: "Priya — can we build a sandbox environment that's customer-facing? Something they can play with before procurement gets involved?", timestamp: 242 },
      { speaker: 'Nadia Osei', text: "Yes. It's maybe three weeks of work. I'd need to carve out time from the roadmap.", timestamp: 268 },
      { speaker: 'Alex Rivers', text: "Do it. Marcus, if a sandbox cuts deal cycle by even two weeks on average, what's the revenue impact?", timestamp: 290 },
      { speaker: 'Jordan Mills', text: "Meaningfully. I'd estimate we're losing 20-30% of deals purely to procurement delay. Fixing the technical win speed changes everything.", timestamp: 315 },
      { speaker: 'Alex Rivers', text: "Priya, the sandbox is now the top priority after webhooks ships. Priya — please make sure she has cover to focus on it.", timestamp: 340 },
    ]
  },
  {
    id: 'm6',
    title: 'Hiring Strategy — Q2 Pipeline Review',
    date: '2024-04-18',
    duration: 44,
    participants: ['Marcusee', 'Alex Rivers', 'Priyaharma'],
    transcript: [
      { speaker: 'Marcusee', text: "I've been tracking our pipeline data for the last 90 days and I want to share what I'm seeing, because I think we have a structural issue that's costing us good candidates before they even get to final round.", timestamp: 10 },
      { speaker: 'Alex Rivers', text: "Go ahead.", timestamp: 38 },
      { speaker: 'Marcusee', text: "Our average time from application to offer is 34 days. The market standard for eng candidates at this level is 14 to 21 days. We're double the average. In a competitive hiring market, that's losing us candidates to faster-moving companies.", timestamp: 52 },
      { speaker: 'Priyaharma', text: "Is the bottleneck the technical round or the debrief process?", timestamp: 92 },
      { speaker: 'Marcusee', text: "It's the debrief. We're scheduling them 5 to 7 days after the final interview. By the time we make the decision, candidates have already mentally moved on or received other offers. I want to propose same-day or next-day debriefs going forward.", timestamp: 108 },
      { speaker: 'Alex Rivers', text: "That requires the interview panel to be available same day. Can we actually commit to that?", timestamp: 155 },
      { speaker: 'Marcusee', text: "I've talked to everyone on the typical panels. If I schedule interviews on Tuesdays and Thursdays, I can consistently get debrief slots same day at 5pm. It's a coordination problem, not a capacity problem.", timestamp: 172 },
      { speaker: 'Priyaharma', text: "That actually works for me. My concern has always been that rushed debriefs lead to poor decisions — but if everyone's fresh from the interview that day, the quality actually improves.", timestamp: 215 },
      { speaker: 'Marcusee', text: "Exactly. And one more thing — I want to start sending candidates a brief personal culture note within 24 hours of their first interview. Not templated. I've done this at two previous companies and it measurably increases acceptance rates.", timestamp: 240 },
      { speaker: 'Alex Rivers', text: "What does measurably mean? Do you have the data?", timestamp: 278 },
      { speaker: 'Marcusee', text: "At my last company, acceptance rate went from 62% to 81% after we started the practice. I tracked it over 6 months and 40 offers. Candidates who received a personal note were 3x more likely to respond within 24 hours.", timestamp: 295 },
      { speaker: 'Alex Rivers', text: "That's a real number. Okay. Let's run it. Marcus, you own the process change. Priya, I need you to enforce the debrief timing from your side.", timestamp: 340 },
      { speaker: 'Priyaharma', text: "Done. Marcus, let's set up a shared calendar block so I can protect Tuesday and Thursday afternoons for hiring work.", timestamp: 362 },
      { speaker: 'Marcusee', text: "Perfect. I'll also put together a one-page summary of the candidate pipeline health each week so we're not going into these conversations cold. Transparency makes better decisions.", timestamp: 378 },
    ]
  },
  {
    id: 'm7',
    title: 'Candidate Experience Debrief',
    date: '2024-04-22',
    duration: 28,
    participants: ['Marcusee', 'Nadia Osei', 'Priyaharma'],
    transcript: [
      { speaker: 'Marcusee', text: "I want to share some feedback we've been getting from candidates post-process — both accepted and declined. I think there's signal here worth understanding, and I'd rather find it now than after we lose a few more good people.", timestamp: 8 },
      { speaker: 'Nadia Osei', text: "I'd love to hear the declines more than the accepts. What are we missing?", timestamp: 35 },
      { speaker: 'Marcusee', text: "Three themes in the decline feedback: one — candidates felt the technical round was intense but didn't understand how it mapped to the actual job. Two — they didn't get a clear sense of growth trajectory. Three — the process felt impersonal until the offer stage.", timestamp: 52 },
      { speaker: 'Priyaharma', text: "The first one is actionable. We can give candidates an explicit brief before the technical round explaining what we're testing and why it reflects real work.", timestamp: 92 },
      { speaker: 'Marcusee', text: "That's exactly what I want to propose. It also reduces anxiety and you get cleaner signal — people perform better when they understand the context. It's fairer to the candidate and better data for us.", timestamp: 115 },
      { speaker: 'Nadia Osei', text: "I can write the brief for the engineering round. I know what we actually care about. It'll take me two hours.", timestamp: 145 },
      { speaker: 'Marcusee', text: "That would be incredible, Priya. And on the growth trajectory issue — I've drafted a one-page career path document. Can I get your review on the engineering ladder section?", timestamp: 162 },
      { speaker: 'Priyaharma', text: "Send it to me by end of week. I want to make sure what we're promising is what we can actually deliver.", timestamp: 195 },
      { speaker: 'Marcusee', text: "Absolutely. The last thing I want to do is oversell the experience and create a mismatch. Trust between candidate and company starts before day one.", timestamp: 212 },
      { speaker: 'Nadia Osei', text: "That's actually a really good framing. The onboarding experience starts the moment someone applies, not when they walk in the door.", timestamp: 238 },
      { speaker: 'Marcusee', text: "Exactly. And I think if we get this right, we'll see it in retention numbers 12 months out. People who felt respected in the hiring process tend to stay longer. I'll start tracking that now so we have the data in a year.", timestamp: 258 },
    ]
  },
]

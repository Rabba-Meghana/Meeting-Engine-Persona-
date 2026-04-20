# Meeting Persona Engine

> Behavioral DNA from conversation data — powered by Recall.ai + Groq

A real-time intelligence layer that ingests meeting transcripts and builds deep behavioral profiles of every person who speaks. Not a summarizer. A model of how humans think and communicate.

## What It Does

After analyzing meetings with the same people, you get:

- **Communication DNA** — are they a challenger, a validator, a strategist?
- **Behavioral Radar** — directness, empathy, urgency, risk tolerance, collaboration, strategic thinking
- **Influence Map** — who actually drives decisions vs who just talks
- **Response Predictor** — paste any proposal and get their likely reaction, first question, and objection before you walk in
- **Pre-meeting Brief** — auto-generated playbook for every person you'll meet

## Stack

- **Next.js 15** + TypeScript — App Router, API routes
- **Recall.ai API** — meeting bot infrastructure, transcript extraction
- **Groq (LLaMA 3.3 70B)** — ultra-low latency behavioral analysis
- **Recharts** — radar charts, influence visualization
- **Tailwind CSS** — dark theme UI

## Setup

```bash
git clone https://github.com/Rabba-Meghana/Meeting-Persona-Engine
cd Meeting-Persona-Engine
npm install
```

Create `.env.local`:
```
GROQ_API_KEY=your_groq_key
RECALL_API_KEY=your_recall_key
```

```bash
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Import at vercel.com
3. Add `GROQ_API_KEY` in Environment Variables
4. Deploy

## How It Works

Recall.ai's bot joins any Zoom/Meet/Teams call and extracts the transcript in real-time. This engine ingests those transcripts across multiple meetings, extracts every utterance per person, and runs them through Groq's LLaMA 3.3 70B to build behavioral profiles — communication style, decision patterns, stress responses, influence dynamics.

The insight: 99% of the context you need to work effectively with someone is never written down. It's spoken.

---

*Built on Recall.ai infrastructure — the API layer that makes meeting intelligence possible.*

# Meeting Persona Engine

Behavioral DNA from conversation data. Drop in meeting transcripts — get a deep profile of how each person thinks, decides, and reacts.

## What it does

- Extracts behavioral signals from how people actually speak in meetings
- Scores directness, empathy, risk sensitivity, urgency, strategic thinking, collaboration — from real language patterns
- Predicts how a specific person will react to a specific proposal before you walk in
- Same proposal through two people produces completely different outputs — derived from their transcripts, zero hardcoded logic

## How it works

1. Transcripts are split by speaker
2. A feature extraction engine scores each person on 12 behavioral dimensions (question rate, action density, hedge rate, empathy signals, data orientation, and more)
3. Radar scores are computed from measured rates — not invented by an LLM
4. The prediction engine scores the proposal against each person's measured profile
5. Groq narrates the output in natural language

## Stack

- Next.js 15, TypeScript
- Groq (llama-3.1-8b-instant for narration)
- Recharts for radar and bar charts
- No database — transcript data drives everything

## Run locally

```bash
git clone https://github.com/Rabba-Meghana/Meeting-Engine-Persona-
cd Meeting-Engine-Persona-
npm install
cp .env.example .env.local
# add your GROQ_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Built by

Meghana Rabba — [linkedin.com/in/meghanarabba](https://linkedin.com/in/meghanarabba)

import type { ResolvedCategory, Tone } from './types';

const ROLES: Record<ResolvedCategory, string> = {
  code:
    'You are a senior software engineer with 15+ years of experience in full-stack development, system design, and engineering best practices. You write clean, production-ready, well-structured code.',
  write:
    'You are an expert copywriter and content strategist with deep experience across all writing formats — from long-form articles to social media, ads, and email campaigns.',
  analyze:
    'You are a senior analyst with expertise in critical thinking, data interpretation, competitive analysis, and strategic assessment.',
  business:
    'You are an experienced business strategist and entrepreneur who has built and scaled multiple ventures. You combine strategic vision with real-world execution.',
  explain:
    'You are a master teacher who excels at making complex ideas simple and clear. You use the Feynman technique: explain anything so a curious 12-year-old can understand it, then build up to full depth.',
  creative:
    'You are a creative director and innovation consultant who combines design thinking, lateral thinking, and deep market intuition to generate breakthrough ideas.',
  research:
    'You are a research specialist with expertise in synthesizing information from multiple sources, evaluating evidence quality, and presenting findings in a clear, structured way.',
};

const TASK_LABELS: Record<ResolvedCategory, string> = {
  code:     'Coding task',
  write:    'Writing task',
  analyze:  'Analysis request',
  business: 'Business challenge',
  explain:  'Explain this topic',
  creative: 'Creative challenge',
  research: 'Research topic',
};

const TONE_SUFFIXES: Record<Tone, string> = {
  balanced:
    'Present your response in a clear, balanced manner with practical explanations and concrete examples.',
  detailed:
    'Be thorough and comprehensive. Include detailed explanations, multiple examples, edge cases, and nuanced considerations.',
  concise:
    'Be concise and direct. Provide only the most essential information. Every sentence must earn its place.',
  steps:
    'Structure your entire response as clear, numbered steps. Each step must be actionable, specific, and self-contained.',
  expert:
    'Assume expert-level knowledge. Use precise technical terminology, advanced concepts, and professional-grade depth without over-explaining fundamentals.',
  simple:
    'Explain everything as if to a complete beginner. Use simple language, relatable analogies, and define every technical term immediately after using it.',
};

const BODY_LINES: Record<ResolvedCategory, string[]> = {
  code: [
    '**Requirements:**',
    '- Provide a complete, working implementation with no placeholders or TODOs',
    '- Follow modern best practices and appropriate design patterns',
    '- Include error handling and cover important edge cases',
    '- Add inline comments only for non-obvious logic',
    '',
    '**Output format:**',
    '1. Brief explanation of your approach and the key decisions made',
    '2. Full, runnable code',
    '3. How to run or integrate it',
    '4. One noteworthy alternative approach (if applicable)',
  ],
  write: [
    '**Deliver:**',
    '- A polished, ready-to-publish piece',
    '- A strong opening hook that grabs attention in the first sentence',
    '- Clear value and natural, engaging flow throughout',
    '- A compelling call to action where appropriate',
    '',
    '**Style guidelines:** Active voice, specific over vague, concrete over abstract.',
    'No filler phrases or clichés. Every word must serve a purpose.',
  ],
  analyze: [
    '**Analysis framework:**',
    '1. **Overview** — Set the context and define the scope',
    '2. **Key Findings** — The most important insights with supporting reasoning',
    '3. **Strengths & Opportunities** — What works and what can be leveraged',
    '4. **Weaknesses & Risks** — Honest assessment of challenges and threats',
    '5. **Recommendations** — Specific, prioritized, actionable next steps',
    '',
    'Use evidence-based reasoning. Explicitly flag assumptions and areas of uncertainty.',
  ],
  business: [
    '**Deliverables:**',
    '1. **Situation Assessment** — Current landscape, context, and key factors',
    '2. **Strategic Options** — 2-3 viable paths with clear trade-offs for each',
    '3. **Recommended Path** — Your top recommendation with full rationale',
    '4. **Action Plan** — Concrete first steps for the next 90 days',
    '5. **Key Risks & Mitigations** — What could go wrong and how to prepare',
    '',
    'Ground all advice in real-world feasibility. Be direct and actionable, not theoretical.',
  ],
  explain: [
    '**Teaching structure:**',
    '1. **Core Idea** — The essence of the concept in one clear, memorable sentence',
    '2. **Simple Analogy** — Connect it to something familiar from everyday life',
    '3. **How It Works** — A step-by-step breakdown of the mechanism',
    '4. **Real-World Examples** — 2-3 concrete, relatable cases',
    '5. **Common Misconceptions** — What people typically get wrong',
    '6. **Why It Matters** — Practical significance and real-world applications',
    '',
    'Build understanding progressively. Never use jargon without immediately defining it.',
  ],
  creative: [
    '**Creative process:**',
    '1. **Reframe** — Look at the challenge from 3 completely different angles',
    '2. **Diverge** — Generate 5+ bold, unconstrained ideas (quantity before quality)',
    '3. **Converge** — Develop the top 3 concepts with enough detail to evaluate them',
    '4. **Champion** — Your single strongest recommendation with a concrete execution plan',
    '5. **Wild Card** — One surprising approach that others would not think of',
    '',
    'Prioritize genuine originality and real value. Avoid safe, obvious, or predictable answers.',
  ],
  research: [
    '**Research brief:**',
    '1. **Background** — Key historical context and the current landscape',
    '2. **Core Findings** — Most important verified facts, data points, and insights',
    '3. **Multiple Perspectives** — Different schools of thought and viewpoints',
    '4. **Consensus vs. Debate** — Where experts agree vs. where disagreement persists',
    '5. **Practical Implications** — What this means in practice and why it matters',
    '',
    'Clearly distinguish between established facts, interpretations, and speculation.',
    'Flag uncertainty and knowledge gaps explicitly.',
  ],
};

export function buildPrompt(
  topic: string,
  category: ResolvedCategory,
  tone: Tone,
): string {
  return [
    ROLES[category],
    '',
    `**${TASK_LABELS[category]}:** ${topic}`,
    '',
    ...BODY_LINES[category],
    '',
    TONE_SUFFIXES[tone],
  ].join('\n');
}

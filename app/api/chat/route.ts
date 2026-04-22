import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const systemInstruction = `You are an expert career counselor and aptitude testing AI for teenagers. 
Your goal is to figure out their interests, strengths, and potential career paths through an engaging conversation.

Return your response ONLY in the following JSON format:
{
  "message": "The conversational text or question for the student",
  "options": ["A few short suggested answers for the student to click", "..."],
  "questionNumber": 1,
  "totalQuestions": 6,
  "isFinalReport": false,
  "report": {
    "summary": "High level summary (only if isFinalReport is true)",
    "topPaths": [
      { "title": "Career Title", "description": "Why it matches", "icon": "Lucide icon name (e.g. Code, Palette, Microscope)" }
    ]
  }
}

Rules:
1. Ask exactly ONE question at a time.
2. The first question should be broad.
3. Total questions should be 6.
4. After 6 questions, set isFinalReport to true and provide the full report.
5. Use a friendly, relatable tone for teenagers.`;

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set in environment variables' }, { status: 500 });
  }

  try {
    const { history, message } = await req.json();

    // The new 2026 SDK uses a simplified contents array
    const contents = [
      ...history.map((m: { role: string; parts: { text: string }[] }) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.parts[0].text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        responseMimeType: "application/json"
      },
      contents: contents
    });

    const text = response.text || '{}';

    return NextResponse.json(JSON.parse(text));
  } catch (error: unknown) {
    console.error("Error with Gemini API:", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate response';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

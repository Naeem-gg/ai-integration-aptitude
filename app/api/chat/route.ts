import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY || '';
const provider = process.env.AI_PROVIDER || 'gemini';
const localBaseUrl = provider === 'ollama' 
  ? process.env.OLLAMA_BASE_URL 
  : process.env.LM_STUDIO_BASE_URL;
const localModel = process.env.LOCAL_MODEL_NAME || 'llama3';

const ai = new GoogleGenAI({ apiKey });

const systemInstruction = `You are an expert career counselor and aptitude testing AI for teenagers. 
Your goal is to figure out their interests, strengths, and potential career paths through an engaging conversation.

Return your response ONLY in the following JSON format:
{
  "message": "The conversational text or question for the student",
  "options": ["Option 1", "Option 2", "Option 3"],
  "questionNumber": 1,
  "totalQuestions": 6,
  "isFinalReport": false,
  "report": {
    "summary": "High level summary (only if isFinalReport is true)",
    "topPaths": [
      { 
        "title": "Career Title", 
        "description": "Why it matches", 
        "icon": "Lucide icon name",
        "courses": ["B.Tech in CS (IITs/NITs)", "M.Tech or MBA (IIMs)"]
      }
    ]
  }
}

Rules:
1. Ask exactly ONE question at a time.
2. Focus on the INDIAN education system and job market.
3. Total questions should be 6.
4. After 6 questions, set isFinalReport to true and provide the full report.
5. Suggest specific Indian degrees (Bachelors/Masters) and top institutions (IIT, BITS, NID, AIIMS, IIM).
6. DO NOT use ellipses (...) or placeholders in the JSON. Provide complete responses.`;

export async function POST(req: Request) {
  try {
    const { history, message, provider: requestedProvider } = await req.json();
    
    // Determine which provider to use: Priority is Body > Env
    let activeProvider = requestedProvider || process.env.AI_PROVIDER || 'gemini';

    // Production Fallback: If local provider is selected but URL is missing (Vercel), use Groq
    if ((activeProvider === 'lmstudio' && !process.env.LM_STUDIO_BASE_URL) || 
        (activeProvider === 'ollama' && !process.env.OLLAMA_BASE_URL)) {
      console.log(`[AI Routing] Local provider ${activeProvider} unavailable in this environment. Falling back to Groq.`);
      activeProvider = 'groq';
    }

    if (activeProvider === 'gemini') {
      if (!apiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
      }

      const contents = [
        ...history.map((m: { role: string; parts: { text: string }[] }) => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.parts[0].text }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        config: {
          systemInstruction: { parts: [{ text: systemInstruction }] },
          responseMimeType: "application/json"
        },
        contents: contents
      });

      return NextResponse.json(JSON.parse(response.text || '{}'));
    } else {
      // OpenAI-compatible providers (Groq, LM Studio, Ollama)
      let baseUrl = '';
      let authToken = '';
      let model = '';

      if (activeProvider === 'groq') {
        baseUrl = 'https://api.groq.com/openai';
        authToken = process.env.GROQ_API_KEY || '';
        model = process.env.GROQ_MODEL_NAME || 'llama-3.3-70b-versatile';
      } else {
        // Local providers
        baseUrl = activeProvider === 'ollama' ? process.env.OLLAMA_BASE_URL! : process.env.LM_STUDIO_BASE_URL!;
        model = process.env.LOCAL_MODEL_NAME || 'llama3';
        authToken = 'not-needed';
      }

      const messages = [
        { role: 'system', content: systemInstruction + "\n\nCRITICAL: YOU MUST RESPOND ONLY IN THE SPECIFIED JSON FORMAT. DO NOT ADD ANY CONVERSATIONAL TEXT OUTSIDE THE JSON." },
        ...history.map((m: { role: string; parts: { text: string }[] }) => ({
          role: m.role === 'model' ? 'assistant' : 'user',
          content: m.parts[0].text
        })),
        { 
          role: 'user', 
          content: message + "\n\n(Reminder: Respond ONLY with the JSON object. Do not explain your answer. Do not use '...' inside the JSON.)" 
        }
      ];

      try {
        const fullUrl = `${baseUrl}/v1/chat/completions`;
        console.log(`[AI Routing] ${activeProvider} -> ${model}`);
        
        const res = await fetch(fullUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            model: model,
            messages,
            temperature: 0.7,
            ...(activeProvider === 'groq' ? { response_format: { type: "json_object" } } : {})
          })
        });

        if (!res.ok) {
          const errorData = await res.text();
          throw new Error(`AI Provider error (${res.status}): ${errorData}`);
        }

        const data = await res.json();
        let content = data.choices[0].message.content || '{}';

        // Cleanup & Repair logic
        content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        const firstBracket = content.indexOf('{');
        const lastBracket = content.lastIndexOf('}');
        if (firstBracket !== -1 && lastBracket !== -1) {
          content = content.substring(firstBracket, lastBracket + 1);
        }
        content = content.replace(/,\s*([\]}])/g, '$1').replace(/\.\.\./g, '');

        return NextResponse.json(JSON.parse(content));
      } catch (fetchError: any) {
        console.error(`[AI Connection Error] ${activeProvider}:`, fetchError);
        return NextResponse.json({ 
          message: `Connection failed with ${activeProvider}. ${fetchError.message}`,
          error: 'CONNECTION_FAILED'
        }, { status: 503 });
      }
    }
  } catch (error: unknown) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ message: 'Failed to generate response' }, { status: 500 });
  }
}

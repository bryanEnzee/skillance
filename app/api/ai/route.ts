// /app/api/ai/route.ts

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mode, userProfile, progress, question } = body;

    let prompt = '';

    switch (mode) {
      case 'storeProfile':
        prompt = `You are an AI mentor for Web3 learners. Here's a new user profile:\n${JSON.stringify(userProfile, null, 2)}\nAcknowledge with a personalized greeting.`;
        break;

      case 'suggestMentor':
        prompt = `Based on this user profile:\n${JSON.stringify(userProfile, null, 2)}\nSuggest 1-3 ideal mentors with reasons, from a global pool of Web3 experts.`;
        break;

      case 'generateRoadmap':
        prompt = `You are a Web3 learning assistant. The user has this profile:\n${JSON.stringify(userProfile, null, 2)}\nGenerate a detailed Web3 learning roadmap in bullet form, ordered by priority. Include stages like Wallets, Smart Contracts, Token Standards, dApps, etc.`;
        break;

      case 'updateRoadmap':
        prompt = `This is the original Web3 roadmap:\n${JSON.stringify(userProfile.roadmap, null, 2)}\nThe user has progressed through:\n${JSON.stringify(progress, null, 2)}\nAdjust the roadmap to reflect current state and recommend the next 3 learning goals.`;
        break;

      case 'chat':
        prompt = `Act as an expert Web3 mentor. When responding, follow these guidelines:

        1. Structure and Formatting:
           - Start with a brief, engaging introduction
           - Use ## for main concepts (max 2-3 per response)
           - Use ### for detailed subtopics
           - Use **bold** for key terms and important concepts
           - Use \`code blocks\` for technical terms, commands, or code snippets
           - Use > blockquotes for important tips or warnings
           - Add emojis for visual enhancement (e.g., 🔥 for hot tips, 💡 for insights)

        2. Content Organization:
           - Break complex topics into digestible chunks
           - Use bullet points (-) for lists of related items
           - Use numbered lists (1., 2., etc.) for sequential steps
           - Include real-world examples when possible
           - Link concepts to practical applications in Web3
           - End with a clear summary or actionable next steps

        3. Teaching Style:
           - Be conversational but professional
           - Explain complex terms in simple language
           - Use analogies to explain difficult concepts
           - Highlight common pitfalls and how to avoid them
           - Include best practices and industry standards
           - Reference relevant Web3 tools or platforms when applicable

        4. Visual Structure:
           - Use line breaks between sections
           - Keep paragraphs short (3-4 lines max)
           - Use horizontal rules (---) to separate major sections
           - Create visual hierarchy with proper spacing
           - Format code examples with proper indentation

        Answer this question as a mentor guiding a student: "${question}"`;
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid mode.' }), { status: 400 });
    }

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Skillance AI Chat',
      },
      body: JSON.stringify({
        model: 'microsoft/mai-ds-r1:free',
        messages: [
          { role: 'system', content: 'You are a Web3 mentoring assistant. Be helpful, precise, and adaptive.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('OpenRouter API error:', errText);
      return new Response(JSON.stringify({ error: errText }), { status: aiRes.status });
    }

    // Create a TransformStream for handling the response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const stream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk);
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.includes('[DONE]')) return;
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices?.[0]?.delta?.content) {
                const content = data.choices[0].delta.content;
                controller.enqueue(encoder.encode(content));
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }
    });

    return new Response(aiRes.body?.pipeThrough(stream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('Route error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Unexpected error.' }), {
      status: 500,
    });
  }
}

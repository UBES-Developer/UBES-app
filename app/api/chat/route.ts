import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Create a DeepSeek client that is OpenAI compatible
const deepseek = createOpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, mode } = await req.json();

    const systemMessage = mode === 'admin'
        ? "You are a helpful administrative assistant for the UBES Portal. assist students with deadlines, registration, and campus policies."
        : "You are a helpful academic tutor. Help students with their coursework and concepts.";

    const result = await streamText({
        model: deepseek('deepseek-chat'),
        messages,
        system: systemMessage,
    });

    return result.toDataStreamResponse();
}

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { listCars, shortlistCars, getCarDetail } from '@/app/_lib/carQueries';

const SYSTEM_PROMPT = `You are the CarPilot assistant — an honest, no-pressure car-buying agent embedded in the CarPilot app. Answer questions about the current car inventory using the tools available; don't guess at specifics (prices, mileage, features) you haven't looked up. Be concise and direct, the way a knowledgeable friend would be, not a salesperson. When you mention specific cars, use their name (e.g. "2022 Honda CR-V EX"), not their internal id. If nothing in the inventory matches what the user is asking for, say so plainly rather than stretching a weak match.`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'list_cars',
    description: 'List cars in the current inventory, optionally filtered by deal quality, condition, or fuel type.',
    input_schema: {
      type: 'object',
      properties: {
        deal: { type: 'string', enum: ['Good', 'Fair', 'Over'], description: 'Filter by deal quality vs. market comps' },
        condition: { type: 'string', enum: ['New', 'Certified pre-owned', 'Used'] },
        fuelType: { type: 'string', enum: ['Gas', 'Hybrid', 'Electric'] },
        sortBy: { type: 'string', enum: ['fit', 'tco', 'otd'], description: 'Defaults to fit (best match first)' },
      },
    },
  },
  {
    name: 'shortlist_cars',
    description: "Score and rank cars against a buyer's stated preferences to produce a personalized shortlist. Use this instead of list_cars whenever the user gives any preference (budget, must-haves, fuel type, etc).",
    input_schema: {
      type: 'object',
      properties: {
        maxOtdPrice: { type: 'number', description: 'Maximum out-the-door price in dollars' },
        maxMonthlyTco: { type: 'number', description: 'Maximum monthly total cost of ownership in dollars' },
        fuelPreference: { type: 'string', enum: ['Gas', 'Hybrid', 'Electric'] },
        conditionPreference: { type: 'string', enum: ['New', 'Certified pre-owned', 'Used'] },
        dealQuality: { type: 'string', enum: ['Good only', 'Good or Fair', 'any'] },
        mustHaveKeys: {
          type: 'array',
          items: { type: 'string', enum: ['awd', 'carplay', 'backup', 'mpg', 'thirdrow', 'manual'] },
          description: 'Required features: awd, carplay (Apple CarPlay/Android Auto), backup (backup camera), mpg (35+ mpg), thirdrow, manual (manual transmission)',
        },
        topN: { type: 'number', description: 'How many results to return, default 5' },
      },
    },
  },
  {
    name: 'get_car_detail',
    description: 'Get full details for one specific car by its id (as returned by list_cars or shortlist_cars).',
    input_schema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
];

function runTool(name: string, input: Record<string, unknown>): unknown {
  switch (name) {
    case 'list_cars':
      return listCars(input as Parameters<typeof listCars>[0]);
    case 'shortlist_cars':
      return shortlistCars(input as Parameters<typeof shortlistCars>[0]);
    case 'get_car_detail': {
      const car = getCarDetail(input.id as string);
      return car ?? { error: `No car found with id '${input.id}'` };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MAX_TOOL_ITERATIONS = 5;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Chat is not configured (missing ANTHROPIC_API_KEY).' }, { status: 503 });
  }

  const { messages } = (await req.json()) as { messages: ChatMessage[] };
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages must be a non-empty array' }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const conversation: Anthropic.MessageParam[] = messages.map((m) => ({ role: m.role, content: m.content }));

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const response = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages: conversation,
    });

    if (response.stop_reason !== 'tool_use') {
      const text = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')?.text ?? '';
      return NextResponse.json({ reply: text });
    }

    conversation.push({ role: 'assistant', content: response.content });
    const toolResults: Anthropic.ToolResultBlockParam[] = response.content
      .filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
      .map((block) => ({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(runTool(block.name, block.input as Record<string, unknown>)),
      }));
    conversation.push({ role: 'user', content: toolResults });
  }

  return NextResponse.json({ reply: "I'm having trouble pinning down an answer — could you rephrase or narrow your question?" });
}

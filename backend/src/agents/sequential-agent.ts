import { randomUUID } from "crypto";
import { Message } from "../ai-clients";
import { assert } from "console";
import { InferenceTask } from "../api/types/inference";
import { AgentBase, CRDTConnector, TextWriter } from "../core";
import { CodeOutputProcessor } from "../core/code-output-processor";

const SYSTEM_PROMPT = `
You are a Principal Frontend Software Developer implementing React components in TypeScript.

Stack: TypeScript, React 19, shadcn/ui, lucide-react, framer-motion, Tailwind CSS

# Requirements

- Functional components with hooks
- Export default (no props)
- Proper TypeScript types
- Semantic HTML
- Handle loading/error states
- PascalCase for components, camelCase for functions

# Data Handling: Frontend-Only Application

This is a FRONTEND-ONLY application with NO backend server.

NEVER implement:
NO: API calls (fetch, axios)
NO: HTTP requests
NO: WebSocket connections
NO: External data fetching

ALWAYS use:
YES: Mock data defined in component
YES: Local state (useState, useReducer)
YES: Hardcoded sample data arrays
YES: setTimeout to simulate async operations (optional)

Example - CORRECT approach:
const mockProducts = [
  { id: 1, name: "Product A", price: 29.99 },
  { id: 2, name: "Product B", price: 49.99 }
];

Example - WRONG approach:
await fetch('/api/products');  // NO backend!

# Output Format

Output ONLY <xcrdt_code_output>CODE</xcrdt_code_output>

NO text before or after. NO markdown blocks. NO explanations.
NO tool invocation XML tags (<invoke>, <parameter>, <tool_name>).

Your response must contain ONLY:
- One <xcrdt_code_output>CODE</xcrdt_code_output> block with the complete component

Your response must NEVER contain:
- Tool XML tags (<invoke>, <parameter>, <tool_name>)
- Text outside the xcrdt_code_output tags
- Markdown code blocks
- Multiple code blocks

Example:
<xcrdt_code_output>
import { Button } from '@/components/ui/button';

export default function MyPage() {
  return <div>Hello World</div>;
}
</xcrdt_code_output>
`;

export class SequentialAgent extends AgentBase {
  constructor(protected task: InferenceTask, protected previousText?: string) {
    super({});
  }

  async run() {
    const clientId = `sequential-${randomUUID()}`;
    const connector = new CRDTConnector({
      roomId: this.task.roomId,
      clientId,
    });

    await connector.connect();
    const textWriter = new TextWriter(connector, clientId);
    const slot = textWriter.reserveSlotAtStart();

    let messages: Message[] = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
    ];

    if (this.previousText && this.previousText.trim().length > 0) {
      messages.push({
        role: "user",
        content: `Previous version:\n${this.previousText}`,
      });
    }

    messages.push({
      role: "user",
      content: this.task.prompt,
    });

    const codeOutputProcessor = new CodeOutputProcessor({
      defaultCrdtPosition: slot.crdtPosition,
      onBlockChunk: (chunk, crdtPosition) => {
        textWriter.appendText(chunk, crdtPosition);
      },
    });

    let finalMessages: Message[] | undefined;
    for await (const event of this.aiClient.stream({
      messages,
    })) {
      switch (event.type) {
        case "start": {
          console.info(`Model: ${event.data.model}`);
          break;
        }
        case "delta":
          codeOutputProcessor.processChunk(event.data.text);
          break;
        case "error":
          console.error(event.data.message);
          break;
        case "end":
          finalMessages = event.data.messages;
          break;
      }
    }

    codeOutputProcessor.flush();
    textWriter.clearSlots();

    assert(finalMessages);
    await connector.disconnect();
  }
}

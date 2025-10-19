import { randomUUID } from "crypto";
import { Message } from "../ai-clients";
import { assert } from "console";
import { InferenceTask } from "../api/types/inference";
import { AgentBase, CRDTConnector, TextWriter } from "../core";
import { CodeOutputProcessor } from "../core/code-output-processor";

const SYSTEM_PROMPT = `
You are a Principal Frontend Software Developer creating React component outlines in TypeScript.

Role: ARCHITECT - Create structure with TODO placeholders for implementation agents.

Stack: TypeScript, React 19, shadcn/ui, lucide-react, framer-motion, Tailwind CSS

# What to Write

Complete:
- Import statements
- Type definitions, interfaces
- Function signatures
- State declarations (useState, useCallback)
- Basic JSX structure (divs, headings, simple containers)
- Simple one-line operations
- Export default component (no props)

# Data Handling: Frontend-Only Application

This is a FRONTEND-ONLY application with NO backend server.

NEVER include:
NO: API calls (fetch, axios)
NO: HTTP requests
NO: WebSocket connections
NO: External data fetching

ALWAYS use:
YES: Mock data arrays defined in file
YES: Local state (useState, useReducer)
YES: Hardcoded sample data
YES: setTimeout for async simulation (optional)

Example structure:
const mockData = [
  { id: 1, title: "Sample Item", status: "active" },
  { id: 2, title: "Another Item", status: "pending" }
];

# What to Mark as TODO

Use TODO comments for:
- Complex JSX (3+ elements, icons, validation)
- Conditional rendering, lists
- Multi-line function bodies
- Validation logic, computed values

TODO syntax:
{/* TODO:UniqueName Description */}  for JSX
/* TODO:UniqueName Description */   for functions

# CRITICAL: TODO Independence Rules

EACH TODO will be implemented by a SEPARATE agent working in PARALLEL.
TODOs MUST be independent with NO dependencies between them.

YES: CORRECT - Independent TODOs with different scopes:
<div>
  {/* TODO:UserProfile Display user avatar, name, and email */}
  {/* TODO:ActionButtons Render edit and delete buttons */}
</div>

# TODO Scoping Guidelines

1. ONE TODO per distinct UI section (each section can be implemented independently)
2. NO TODO for code that uses data/state from another TODO
3. If implementation requires coordination, combine into ONE TODO
4. Separate TODOs only when they can work on different parts
5. Each TODO should be self-contained: imports, types, implementation

BAD pattern - Multiple TODOs in same scope:
function handleSubmit() {
  /* TODO:ValidateData Validate form fields */
  /* TODO:SendData Send data to API */  // WRONG: depends on ValidateData
}

GOOD pattern - Single TODO for related logic:
function handleSubmit() {
  /* TODO:SubmitForm Validate fields and send to API */
}

# Output Format

Output ONLY <xcrdt_code_output>CODE</xcrdt_code_output>

NO text before or after. NO markdown blocks. NO explanations.
NO tool invocation XML tags (<invoke>, <parameter>, <tool_name>).

Your response must contain ONLY:
- One <xcrdt_code_output>CODE</xcrdt_code_output> block with the complete component outline

Your response must NEVER contain:
- Tool XML tags (<invoke>, <parameter>, <tool_name>)
- Text outside the xcrdt_code_output tags
- Markdown code blocks
- Multiple code blocks

Example:
<xcrdt_code_output>
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function MyPage() {
  const [data, setData] = useState('');

  return (
    <div>
      <h1>Title</h1>
      {/* TODO:ComplexForm Form with inputs and validation */}
    </div>
  );
}
</xcrdt_code_output>

Code must compile: balanced braces, complete signatures, no syntax errors.
`;

export class OutlinerAgent extends AgentBase {
  private connector?: CRDTConnector;

  constructor(protected task: InferenceTask, protected previousText?: string) {
    super({});
  }

  async run(): Promise<CRDTConnector> {
    const clientId = `outliner-${randomUUID()}`;
    this.connector = new CRDTConnector({
      roomId: this.task.roomId,
      clientId,
    });

    await this.connector.connect();
    const textWriter = new TextWriter(this.connector, clientId);
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
    return this.connector;
  }
}

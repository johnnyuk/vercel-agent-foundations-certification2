import { WorkflowAgent, type ModelCallStreamPart } from "@ai-sdk/workflow";
import { getWritable } from "workflow";
import {
  convertToModelMessages,
  type UIMessage,
} from "ai";
import { SHOPPING_AGENT_INSTRUCTIONS } from "@/lib/agent-instructions";
import { searchProducts, getAllCategories, returnOrder, getProductDetails } from "@/lib/tools";

export async function chatFlow(messages: UIMessage[]) {
  "use workflow";

  const modelMessages = await convertToModelMessages(messages);

  const agent = new WorkflowAgent({
    model: "anthropic/claude-sonnet-5",
    instructions: SHOPPING_AGENT_INSTRUCTIONS,
    tools: { searchProducts, getAllCategories, returnOrder, getProductDetails },
  });

  await agent.stream({
    messages: modelMessages,
    writable: getWritable<ModelCallStreamPart>(),
  });
}
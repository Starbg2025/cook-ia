import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText, generateText } from 'ai';

const provider = createOpenAICompatible({
  name: "modal-glm-5",
  baseURL: process.env.LLM_BACKEND_URL || "https://api.us-west-2.modal.direct/v1",
  apiKey: process.env.LLM_BACKEND_API_KEY ?? "",
});

export const modalModel = provider.chatModel("zai-org/GLM-5-FP8");

/**
 * Generates code or text using the GLM-5 model via Modal.
 */
export async function generateWithGLM(prompt: string, systemInstruction?: string) {
  const { text } = await generateText({
    model: modalModel,
    system: systemInstruction,
    prompt: prompt,
  });
  return text;
}

/**
 * Use this for streaming responses if needed in the UI.
 */
export function streamWithGLM(prompt: string, systemInstruction?: string) {
  return streamText({
    model: modalModel,
    system: systemInstruction,
    prompt: prompt,
  });
}

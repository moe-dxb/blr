// Summarize Policy Flow
"use server";

/**
 * @fileOverview A policy summarization AI agent.
 *
 * - summarizePolicy - A function that handles the policy summarization process.
 * - SummarizePolicyInput - The input type for the summarizePolicy function.
 * - SummarizePolicyOutput - The return type for the summarizePolicy function.
 */

import {ai} from "../genkit";
import {z} from "genkit";

const SummarizePolicyInputSchema = z.object({
  documentText: z
    .string()
    .describe("The text content of the policy document to be summarized."),
});
export type SummarizePolicyInput = z.infer<typeof SummarizePolicyInputSchema>;

const SummarizePolicyOutputSchema = z.object({
  summary: z.string().describe("A concise summary of the policy document."),
});
export type SummarizePolicyOutput = z.infer<typeof SummarizePolicyOutputSchema>;

export async function summarizePolicy(
  input: SummarizePolicyInput
): Promise<SummarizePolicyOutput> {
  return summarizePolicyFlow(input);
}

const prompt = ai.definePrompt({
  name: "summarizePolicyPrompt",
  input: {schema: SummarizePolicyInputSchema},
  output: {schema: SummarizePolicyOutputSchema},
  prompt: `You are an AI assistant designed to summarize company policy documents.  Provide a concise summary of the following document.

Document: {{{documentText}}}`,
});

export const summarizePolicyFlow = ai.defineFlow(
  {
    name: "summarizePolicyFlow",
    inputSchema: SummarizePolicyInputSchema,
    outputSchema: SummarizePolicyOutputSchema,
  },
  async (input: SummarizePolicyInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);

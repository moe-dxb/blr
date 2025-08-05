
'use server';

/**
 * @fileOverview An AI agent for generating employee performance reviews.
 *
 * - generatePerformanceReview - A function that handles the review generation process.
 * - PerformanceReviewInput - The input type for the generatePerformanceReview function.
 * - PerformanceReviewOutput - The return type for the generatePerformanceReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PerformanceReviewInputSchema = z.object({
  name: z.string().describe('The name of the employee being reviewed.'),
  role: z.string().describe('The role or job title of the employee.'),
});
export type PerformanceReviewInput = z.infer<typeof PerformanceReviewInputSchema>;

const PerformanceReviewOutputSchema = z.object({
  strengths: z.array(z.string()).describe('A list of the employee\'s key strengths, phrased as bullet points.'),
  areasForImprovement: z.array(z.string()).describe('A list of constructive areas for the employee to improve upon, phrased as bullet points.'),
  suggestedGoals: z.array(z.string()).describe('A list of specific, actionable goals for the next performance period, phrased as bullet points.'),
});
export type PerformanceReviewOutput = z.infer<typeof PerformanceReviewOutputSchema>;

export async function generatePerformanceReview(input: PerformanceReviewInput): Promise<PerformanceReviewOutput> {
  return performanceReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'performanceReviewPrompt',
  input: {schema: PerformanceReviewInputSchema},
  output: {schema: PerformanceReviewOutputSchema},
  prompt: `You are an expert HR manager with decades of experience in writing thoughtful, constructive, and motivating performance reviews.

You are tasked with generating a performance review for an employee.

Employee Name: {{{name}}}
Employee Role: {{{role}}}

Based on their role, please generate a balanced performance review. Provide:
1.  A list of 3-4 likely key strengths.
2.  A list of 2-3 constructive and actionable areas for improvement.
3.  A list of 2-3 specific and measurable goals for the next quarter.

Frame the feedback in a professional, encouraging, and helpful tone. Ensure all generated points are specific and avoid vague platitudes.
`,
});

const performanceReviewFlow = ai.defineFlow(
  {
    name: 'performanceReviewFlow',
    inputSchema: PerformanceReviewInputSchema,
    outputSchema: PerformanceReviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

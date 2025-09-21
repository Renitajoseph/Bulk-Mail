'use server';
/**
 * @fileOverview Implements an AI-powered rate limiter for email sending.
 *
 * - `rateLimitEmail` -  A function that determines whether an email should be sent based on real-time factors.
 * - `RateLimitEmailInput` - The input type for the rateLimitEmail function.
 * - `RateLimitEmailOutput` - The return type for the rateLimitEmail function.
 */

import {ai} from '@/server/ai/genkit';
import {z} from 'genkit';

const RateLimitEmailInputSchema = z.object({
  recipientEmail: z.string().email().describe('The email address of the recipient.'),
  emailContent: z.string().describe('The content of the email being sent.'),
  senderReputationScore: z
    .number()
    .min(0)
    .max(1)
    .describe(
      'A score representing the sender reputation, from 0 (poor) to 1 (excellent).'
    ),
  recipientEngagementScore: z
    .number()
    .min(0)
    .max(1)
    .describe(
      'A score representing the recipient engagement, from 0 (no engagement) to 1 (high engagement).'
    ),
});
export type RateLimitEmailInput = z.infer<typeof RateLimitEmailInputSchema>;

const RateLimitEmailOutputSchema = z.object({
  shouldSendEmail: z
    .boolean()
    .describe(
      'A boolean value indicating whether the email should be sent (true) or blocked (false).'
    ),
  reason: z
    .string()
    .describe(
      'A string providing a reason for the decision, for logging or debugging purposes.'
    ),
});
export type RateLimitEmailOutput = z.infer<typeof RateLimitEmailOutputSchema>;

export async function rateLimitEmail(input: RateLimitEmailInput): Promise<RateLimitEmailOutput> {
  return rateLimitEmailFlow(input);
}

const rateLimitPrompt = ai.definePrompt({
  name: 'rateLimitPrompt',
  input: {schema: RateLimitEmailInputSchema},
  output: {schema: RateLimitEmailOutputSchema},
  prompt: `You are an AI-powered rate limiter that dynamically adjusts email sending frequency to avoid spam flags.

  Based on the following information, determine whether an email should be sent to the recipient:

  - Recipient Email: {{{recipientEmail}}}
  - Email Content: {{{emailContent}}}
  - Sender Reputation Score: {{{senderReputationScore}}} (0 = Poor, 1 = Excellent)
  - Recipient Engagement Score: {{{recipientEngagementScore}}} (0 = No Engagement, 1 = High Engagement)

  Consider factors such as sender reputation, recipient engagement, and email content to make your decision.

  Respond with JSON in the following format:
  {
    "shouldSendEmail": true or false,
    "reason": "A brief explanation for the decision"
  }`,
});

const rateLimitEmailFlow = ai.defineFlow(
  {
    name: 'rateLimitEmailFlow',
    inputSchema: RateLimitEmailInputSchema,
    outputSchema: RateLimitEmailOutputSchema,
  },
  async input => {
    const {output} = await rateLimitPrompt(input);
    return output!;
  }
);

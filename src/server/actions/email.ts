'use server';

import { z } from 'zod';
import type { EmailBatch, EmailResult } from '@/lib/types';
import nodemailer from 'nodemailer';

const FormSchema = z.object({
  subject: z.string().min(1, 'Subject is required.'),
  body: z.string().min(1, 'Email body is required.'),
  recipients: z.string().min(1, 'Recipients are required.'),
});

type State = {
  message?: string | null;
  errors?: {
    subject?: string[];
    body?: string[];
    recipients?: string[];
  };
  batch?: EmailBatch | null;
};

export async function sendBulkEmail(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = FormSchema.safeParse({
    subject: formData.get('subject'),
    body: formData.get('body'),
    recipients: formData.get('recipients'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Send Email.',
    };
  }

  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_EMAIL === 'your-email@gmail.com') {
    return {
      message: 'Email service is not configured. Please set GMAIL_EMAIL and GMAIL_APP_PASSWORD in your .env file.',
    };
  }

  // Configure Nodemailer with your Gmail credentials
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });


  const recipients = validatedFields.data.recipients
    .split(/[\n,;]+/)
    .map((email) => email.trim())
    .filter((email) => email.length > 0 && z.string().email().safeParse(email).success)
    .filter((value, index, self) => self.indexOf(value) === index); // Unique emails

  if (recipients.length === 0) {
    return { message: 'Please provide at least one valid recipient email.' };
  }

  const { subject, body } = validatedFields.data;

  const results: EmailResult[] = await Promise.all(
    recipients.map(async (recipient) => {
      try {
        // Send mail with defined transport object
        await transporter.sendMail({
          from: `"Bulkmail App" <${process.env.GMAIL_EMAIL}>`, // sender address
          to: recipient, // list of receivers
          subject: subject, // Subject line
          text: body, // plain text body
          html: `<p>${body.replace(/\n/g, '<br>')}</p>`, // html body
        });
        return { recipient, status: 'Sent' as const, reason: 'Email sent successfully.' };

      } catch (error) {
        console.error(`Failed to send email to ${recipient}:`, error);
        const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred.';
        return { recipient, status: 'Failed' as const, reason: `Failed to send: ${errorMessage}` };
      }
    })
  );

  const batch: EmailBatch = {
    id: new Date().toISOString(),
    subject: subject,
    body: body,
    recipients: recipients,
    results,
    sentAt: new Date().toISOString(),
  };

  return { message: 'Email batch processing complete.', batch };
}

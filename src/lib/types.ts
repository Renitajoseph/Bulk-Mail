export type EmailResult = {
  recipient: string;
  status: 'Sent' | 'Blocked' | 'Failed';
  reason: string;
};

export type EmailBatch = {
  id: string;
  subject: string;
  body: string;
  recipients: string[];
  results: EmailResult[];
  sentAt: string;
};

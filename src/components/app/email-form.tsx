'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Loader2, Send, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

import { sendBulkEmail } from '@/server/actions/email';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { EmailBatch, EmailResult } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const HISTORY_KEY = 'bulkmail_history';

const FormSchema = z.object({
  subject: z.string().min(1, 'Subject is required.'),
  body: z.string().min(1, 'Email body is required.'),
  recipients: z.string().min(1, 'At least one recipient is required.'),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Send Emails
        </>
      )}
    </Button>
  );
}

const StatusIcon = ({ status }: { status: EmailResult['status'] }) => {
  switch (status) {
    case 'Sent':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'Blocked':
      return <XCircle className="h-5 w-5 text-yellow-500" />;
    case 'Failed':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    default:
      return null;
  }
};

export function EmailForm() {
  const [state, formAction] = useFormState(sendBulkEmail, { message: null, batch: null });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      subject: '',
      body: '',
      recipients: '',
    },
  });

  useEffect(() => {
    if (state.message && state.batch) {
      toast({
        title: 'Batch Processed',
        description: `${state.batch.results.filter((r) => r.status === 'Sent').length} emails sent.`,
      });

      const storedHistory = localStorage.getItem(HISTORY_KEY);
      const history: EmailBatch[] = storedHistory ? JSON.parse(storedHistory) : [];
      history.unshift(state.batch);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50))); // Limit history size
      form.reset();

    } else if (state.message && !state.batch) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, form]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Compose Email</CardTitle>
          <CardDescription>Enter the details for your bulk email campaign.</CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction} className="flex flex-col flex-1">
          <CardContent className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" placeholder="Your amazing subject line" />
              {state.errors?.subject && <p className="text-sm text-destructive">{state.errors.subject[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipients">Recipients</Label>
              <Textarea
                id="recipients"
                name="recipients"
                placeholder="Enter recipient emails, separated by commas, spaces, or new lines."
                className="min-h-[100px]"
              />
              {state.errors?.recipients && <p className="text-sm text-destructive">{state.errors.recipients[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea id="body" name="body" placeholder="Write your email content here." className="min-h-[200px]" />
              {state.errors?.body && <p className="text-sm text-destructive">{state.errors.body[0]}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Results</CardTitle>
          <CardDescription>Status of the most recent email batch.</CardDescription>
        </CardHeader>
        <CardContent>
          {state.batch ? (
            <div className="space-y-4">
               <Alert>
                <Bot className="h-4 w-4" />
                <AlertTitle className="font-headline">AI Rate Limiter Active</AlertTitle>
                <AlertDescription>
                  Each email is analyzed to prevent spam and improve deliverability.
                </AlertDescription>
              </Alert>
              <ScrollArea className="h-[450px] border rounded-md">
                <TooltipProvider>
                  <Table>
                    <TableHeader className="sticky top-0 bg-card">
                      <TableRow>
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {state.batch.results.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-center">
                            <StatusIcon status={result.status} />
                          </TableCell>
                          <TableCell className="font-medium">{result.recipient}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                            <Badge variant={result.status === 'Sent' ? 'default' : result.status === 'Blocked' ? 'secondary' : 'destructive'}>
                              {result.status}
                            </Badge>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{result.reason}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TooltipProvider>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[450px] text-center bg-muted/50 rounded-lg">
              <Bot className="h-16 w-16 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Your email batch results will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

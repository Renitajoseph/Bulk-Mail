'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Eye, Mail, Users } from 'lucide-react';
import type { EmailBatch, EmailResult } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const HISTORY_KEY = 'bulkmail_history';

const StatusBadge = ({ status }: { status: EmailResult['status'] }) => {
  switch (status) {
    case 'Sent':
      return <Badge variant="default">Sent</Badge>;
    case 'Blocked':
      return <Badge variant="secondary">Blocked</Badge>;
    case 'Failed':
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return null;
  }
};

export default function HistoryPage() {
  const [history, setHistory] = useState<EmailBatch[]>([]);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const storedHistory = localStorage.getItem(HISTORY_KEY);
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // or a loading skeleton
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Sent Email History</CardTitle>
          <CardDescription>A log of your previously sent email campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <ScrollArea className="h-[60vh] md:h-[70vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell>
                        {new Date(batch.sentAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{batch.subject}</TableCell>
                      <TableCell>{batch.recipients.length}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle className="font-headline">{batch.subject}</DialogTitle>
                              <DialogDescription>
                                Sent on {new Date(batch.sentAt).toLocaleString()} to {batch.recipients.length} recipients.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 max-h-[60vh] overflow-y-auto">
                              <div className="space-y-4">
                                <h3 className="font-semibold font-headline flex items-center gap-2"><Mail className="h-4 w-4" /> Email Content</h3>
                                <div className="prose prose-sm dark:prose-invert bg-muted/50 p-4 rounded-md text-foreground">
                                  <pre className="whitespace-pre-wrap font-body text-sm">{batch.body}</pre>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h3 className="font-semibold font-headline flex items-center gap-2"><Users className="h-4 w-4" /> Recipient Status</h3>
                                <ScrollArea className="h-[40vh] border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                        {batch.results.map((result) => (
                                            <TableRow key={result.recipient}>
                                                <TableCell>{result.recipient}</TableCell>
                                                <TableCell>
                                                    <StatusBadge status={result.status} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No email history found.</p>
              <p className="text-sm text-muted-foreground">Send your first campaign to see it here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

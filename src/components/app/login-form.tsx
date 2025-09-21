'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Upload } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      login();
      router.push('/');
    } else {
      setError('Please enter your email and password.');
    }
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={handleLogin} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or send to a list
          </span>
        </div>
      </div>

      <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-md">
                <Upload className="h-5 w-5" />
            </div>
            <div>
                <h3 className="font-semibold text-foreground">Bulk Send from File</h3>
                <p className="text-sm text-muted-foreground">Upload an Excel or CSV file.</p>
            </div>
        </div>
        <Input id="file" type="file" className="bg-background" />
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Mail, History, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { href: '/', label: 'Send', icon: Mail },
    { href: '/history', label: 'History', icon: History },
  ];

  if (!isClient || !isAuthenticated) {
    if (pathname === '/login') return null; // Don't show header on login page
    return null; // or a loading skeleton if you prefer
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-md">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold font-headline text-foreground">Bulkmail App</h1>
        </Link>
        <nav className="flex items-center gap-2">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant={pathname === link.href ? 'secondary' : 'ghost'}
              size="sm"
              asChild
            >
              <Link href={link.href} className="flex items-center gap-2">
                <link.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}

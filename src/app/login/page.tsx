import { LoginForm } from '@/components/app/login-form';
import Image from 'next/image';

export default function LoginPage() {

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Welcome to Bulkmail App</h1>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access the ultimate bulk mailing solution
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
            <Image
            src="https://picsum.photos/seed/3/1200/1800"
            alt="Abstract image representing digital communication"
            data-ai-hint="digital communication"
            width="1200"
            height="1800"
            className="h-full w-full object-cover dark:brightness-[0.3]"
            />
      </div>
    </div>
  );
}

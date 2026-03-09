'use client';

import RegisterForm from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary-dark">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-accent-orange/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent-red/10 to-transparent rounded-full blur-3xl"></div>
      </div>
      <RegisterForm />
    </div>
  );
}
